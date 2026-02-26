import {
  Alert,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useRouter } from "expo-router";
import { getAuth } from "firebase/auth";
import { useCallback, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProfileScreen() {
  const router = useRouter();
  const auth = getAuth();
  const [userEmail, setUserEmail] = useState<string | null>("");
  const [userName, setUserName] = useState<string | null>("");
  const [isGuest, setIsGuest] = useState(true);

  useFocusEffect(
    useCallback(() => {
      const fetchUserData = async () => {
        const email = await AsyncStorage.getItem("userEmail");
        const name = await AsyncStorage.getItem("userName");
        const guestFlag = await AsyncStorage.getItem("isguest");
        setUserEmail(email);
        setUserName(name);
        setIsGuest(guestFlag === "true" || !email || email === "guest");
      };
      fetchUserData();
    }, []),
  );

  const getInitials = () => {
    if (!userName) return "G";
    return userName
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      await AsyncStorage.removeItem("userEmail");
      await AsyncStorage.removeItem("userName");
      await AsyncStorage.setItem("isguest", "true");
      router.push("/Signin");
      Alert.alert("Logged Out", "You have been logged out successfully.");
    } catch (error) {
      Alert.alert("Logout failed");
    }
  };

  const isLoggedIn = !isGuest;

  return (
    <SafeAreaView className="flex-1 bg-[#d1bea7]">
      <StatusBar backgroundColor="#1e293b" barStyle="light-content" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* ── Header Banner ─────────────────────────────────── */}
        <View className="bg-slate-800 pt-8 pb-16 px-6 rounded-b-[32px]">
          <Text className="text-white text-xl font-bold text-center">
            My Profile
          </Text>
        </View>

        {/* ── Avatar Card ───────────────────────────────────── */}
        <View className="items-center -mt-12 px-4">
          <View
            className="bg-white rounded-3xl w-full px-6 pt-14 pb-6 items-center"
            style={{
              elevation: 8,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.15,
              shadowRadius: 12,
            }}
          >
            {/* Avatar Circle */}
            <View
              className="absolute -top-12 bg-slate-800 w-24 h-24 rounded-full items-center justify-center border-4 border-orange-400"
              style={{
                elevation: 6,
                shadowColor: "#fb923c",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
              }}
            >
              {isLoggedIn ? (
                <Text className="text-orange-400 text-3xl font-bold">
                  {getInitials()}
                </Text>
              ) : (
                <Ionicons name="person" size={40} color="#fb923c" />
              )}
            </View>

            {isLoggedIn ? (
              <>
                {/* User Name */}
                {userName && (
                  <Text className="text-slate-800 text-xl font-bold mt-2">
                    {userName}
                  </Text>
                )}
                {/* Email */}
                <View className="flex-row items-center gap-1.5 mt-1.5">
                  <Ionicons name="mail-outline" size={14} color="#94a3b8" />
                  <Text className="text-slate-500 text-sm">{userEmail}</Text>
                </View>

                {/* Divider */}
                <View className="h-px w-full bg-slate-100 my-5" />

                {/* Member Since Badge */}
                {userEmail === "guest" ? (
                  <View className="bg-slate-50 rounded-xl px-4 py-2.5 flex-row items-center gap-2">
                    <Ionicons
                      name="shield-checkmark"
                      size={16}
                      color="#22c55e"
                    />
                    <Text className="text-slate-600 text-xs font-medium">
                      Guest User
                    </Text>
                  </View>
                ) : (
                  <View className="bg-slate-50 rounded-xl px-4 py-2.5 flex-row items-center gap-2">
                    <Ionicons
                      name="shield-checkmark"
                      size={16}
                      color="#22c55e"
                    />
                    <Text className="text-slate-600 text-xs font-medium">
                      Verified Member
                    </Text>
                  </View>
                )}
              </>
            ) : (
              <>
                <Text className="text-slate-800 text-lg font-bold mt-2">
                  Guest User
                </Text>
                <Text className="text-slate-400 text-sm mt-1">
                  Sign in to access your profile
                </Text>
              </>
            )}
          </View>
        </View>

        {/* ── Menu Section ──────────────────────────────────── */}
        {isLoggedIn && (
          <View className="px-4 mt-6">
            <Text className="text-slate-700 font-semibold text-base mb-3 ml-1">
              Account Settings
            </Text>

            <View
              className="bg-white rounded-2xl overflow-hidden"
              style={{
                elevation: 4,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.08,
                shadowRadius: 6,
              }}
            >
              {/* Menu Items */}
              <MenuItem
                icon="person-outline"
                label="Edit Profile"
                color="#3b82f6"
                onPress={() => router.push("/profile/EditProfile")}
              />
              <View className="h-px bg-slate-50 mx-4" />
              <MenuItem
                icon="notifications-outline"
                label="Notifications"
                color="#f59e0b"
                onPress={() => router.push("/profile/Notifications")}
              />
              <View className="h-px bg-slate-50 mx-4" />
              <MenuItem
                icon="receipt-outline"
                label="My Bookings"
                color="#8b5cf6"
                onPress={() => router.navigate("/(tabs)/History")}
              />

              <View className="h-px bg-slate-50 mx-4" />
              <MenuItem
                icon="help-circle-outline"
                label="Help & Support"
                color="#10b981"
                onPress={() => router.push("/profile/Support")}
              />
            </View>
          </View>
        )}

        {/* ── Action Buttons ────────────────────────────────── */}
        <View className="px-4 mt-8">
          {isLoggedIn ? (
            <TouchableOpacity
              onPress={handleLogout}
              activeOpacity={0.85}
              className="bg-slate-800 py-4 rounded-2xl border-2 border-red-400 flex-row items-center justify-center gap-2"
              style={{
                elevation: 4,
                shadowColor: "#ef4444",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 6,
              }}
            >
              <Ionicons name="log-out-outline" size={20} color="#f87171" />
              <Text className="text-red-400 text-base font-bold">Logout</Text>
            </TouchableOpacity>
          ) : (
            <View className="gap-3">
              <TouchableOpacity
                onPress={() => router.push("/Signin")}
                activeOpacity={0.85}
                className="bg-slate-800 py-4 rounded-2xl border-2 border-orange-400 flex-row items-center justify-center gap-2"
                style={{
                  elevation: 4,
                  shadowColor: "#fb923c",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.2,
                  shadowRadius: 6,
                }}
              >
                <Ionicons name="log-in-outline" size={20} color="#fb923c" />
                <Text className="text-orange-400 text-base font-bold">
                  Sign In
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => router.push("/Signup")}
                activeOpacity={0.85}
                className="bg-white py-4 rounded-2xl border-2 border-slate-200 flex-row items-center justify-center gap-2"
                style={{ elevation: 2 }}
              >
                <Ionicons name="person-add-outline" size={20} color="#1e293b" />
                <Text className="text-slate-800 text-base font-bold">
                  Create Account
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* ── App Version ───────────────────────────────────── */}
        <Text className="text-center text-slate-500 text-sm mt-8">
          Dine Time v1.5.0
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Reusable Menu Item ──────────────────────────────────────────────────────────
function MenuItem({
  icon,
  label,
  color,
  onPress,
}: {
  icon: any;
  label: string;
  color: string;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      className="flex-row items-center px-4 py-3.5"
      onPress={onPress}
    >
      <View
        className="w-9 h-9 rounded-xl items-center justify-center mr-3"
        style={{ backgroundColor: color + "15" }}
      >
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <Text className="flex-1 text-slate-700 text-sm font-medium">{label}</Text>
      <Ionicons name="chevron-forward" size={18} color="#cbd5e1" />
    </TouchableOpacity>
  );
}
