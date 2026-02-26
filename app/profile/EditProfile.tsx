import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { getAuth } from "firebase/auth";
import { doc, getFirestore, updateDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StatusBar,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function EditProfileScreen() {
    const router = useRouter();
    const auth = getAuth();
    const db = getFirestore();

    const [userName, setUserName] = useState("");
    const [userEmail, setUserEmail] = useState("");
    const [originalName, setOriginalName] = useState("");
    const [saving, setSaving] = useState(false);
    const [focusedField, setFocusedField] = useState<string | null>(null);

    useEffect(() => {
        const loadUserData = async () => {
            const name = await AsyncStorage.getItem("userName");
            const email = await AsyncStorage.getItem("userEmail");
            setUserName(name || "");
            setOriginalName(name || "");
            setUserEmail(email || "");
        };
        loadUserData();
    }, []);

    const getInitials = () => {
        if (!userName) return "?";
        return userName
            .split(" ")
            .map((w) => w[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    const hasChanges = userName.trim() !== originalName;

    const handleSave = async () => {
        const trimmed = userName.trim();
        if (!trimmed) {
            Alert.alert("Invalid Name", "Name cannot be empty.");
            return;
        }

        setSaving(true);
        try {
            // Update AsyncStorage
            await AsyncStorage.setItem("userName", trimmed);

            // Update Firestore if user is signed in
            const user = auth.currentUser;
            if (user) {
                await updateDoc(doc(db, "users", user.uid), {
                    userName: trimmed,
                });
            }

            setOriginalName(trimmed);
            Alert.alert("Success", "Your profile has been updated.", [
                { text: "OK", onPress: () => router.back() },
            ]);
        } catch (error) {
            console.error("Error updating profile:", error);
            Alert.alert("Error", "Failed to update profile. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-[#d1bea7]">
            <StatusBar backgroundColor="#1e293b" barStyle="light-content" />

            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                className="flex-1"
            >
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 40 }}
                >
                    {/* ── Header Banner ───────────────────────────────── */}
                    <View className="bg-slate-800 pt-4 pb-16 px-6 rounded-b-[32px]">
                        <View className="flex-row items-center">
                            <TouchableOpacity
                                onPress={() => router.back()}
                                className="w-10 h-10 rounded-full bg-white/10 items-center justify-center"
                            >
                                <Ionicons name="arrow-back" size={22} color="#fff" />
                            </TouchableOpacity>
                            <Text className="text-white text-xl font-bold flex-1 text-center mr-10">
                                Edit Profile
                            </Text>
                        </View>
                    </View>

                    {/* ── Avatar Section ──────────────────────────────── */}
                    <View className="items-center -mt-12">
                        <View
                            className="bg-slate-800 w-24 h-24 rounded-full items-center justify-center border-4 border-orange-400"
                            style={{
                                elevation: 6,
                                shadowColor: "#fb923c",
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.3,
                                shadowRadius: 8,
                            }}
                        >
                            <Text className="text-orange-400 text-3xl font-bold">
                                {getInitials()}
                            </Text>
                        </View>
                    </View>

                    {/* ── Form Section ────────────────────────────────── */}
                    <View className="px-5 mt-8">
                        <View
                            className="bg-white rounded-3xl px-6 py-8"
                            style={{
                                elevation: 6,
                                shadowColor: "#000",
                                shadowOffset: { width: 0, height: 3 },
                                shadowOpacity: 0.1,
                                shadowRadius: 10,
                            }}
                        >
                            {/* Full Name */}
                            <Text className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2 ml-1">
                                Full Name
                            </Text>
                            <View
                                className={`flex-row items-center border-2 rounded-2xl px-4 py-3 mb-6 ${focusedField === "name"
                                        ? "border-orange-400 bg-orange-50/30"
                                        : "border-slate-200 bg-slate-50"
                                    }`}
                            >
                                <Ionicons
                                    name="person-outline"
                                    size={20}
                                    color={focusedField === "name" ? "#fb923c" : "#94a3b8"}
                                />
                                <TextInput
                                    className="flex-1 ml-3 text-slate-800 text-base"
                                    value={userName}
                                    onChangeText={setUserName}
                                    onFocus={() => setFocusedField("name")}
                                    onBlur={() => setFocusedField(null)}
                                    placeholder="Enter your name"
                                    placeholderTextColor="#cbd5e1"
                                />
                            </View>

                            {/* Email (read-only) */}
                            <Text className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2 ml-1">
                                Email Address
                            </Text>
                            <View className="flex-row items-center border-2 border-slate-100 bg-slate-50 rounded-2xl px-4 py-3 mb-2">
                                <Ionicons name="mail-outline" size={20} color="#94a3b8" />
                                <Text className="flex-1 ml-3 text-slate-400 text-base">
                                    {userEmail}
                                </Text>
                                <View className="bg-slate-200 rounded-lg px-2 py-1">
                                    <Text className="text-slate-500 text-[10px] font-bold">
                                        READ ONLY
                                    </Text>
                                </View>
                            </View>
                            <Text className="text-slate-400 text-xs ml-1 mt-1">
                                Email cannot be changed for security reasons
                            </Text>
                        </View>

                        {/* ── Save Button ──────────────────────────────── */}
                        <TouchableOpacity
                            onPress={handleSave}
                            disabled={!hasChanges || saving}
                            activeOpacity={0.85}
                            className={`mt-8 py-4 rounded-2xl flex-row items-center justify-center gap-2 ${hasChanges
                                    ? "bg-slate-800 border-2 border-orange-400"
                                    : "bg-slate-300 border-2 border-slate-300"
                                }`}
                            style={
                                hasChanges
                                    ? {
                                        elevation: 4,
                                        shadowColor: "#fb923c",
                                        shadowOffset: { width: 0, height: 2 },
                                        shadowOpacity: 0.2,
                                        shadowRadius: 6,
                                    }
                                    : {}
                            }
                        >
                            {saving ? (
                                <ActivityIndicator color="#fb923c" />
                            ) : (
                                <>
                                    <Ionicons
                                        name="checkmark-circle-outline"
                                        size={20}
                                        color={hasChanges ? "#fb923c" : "#94a3b8"}
                                    />
                                    <Text
                                        className={`text-base font-bold ${hasChanges ? "text-orange-400" : "text-slate-400"
                                            }`}
                                    >
                                        Save Changes
                                    </Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
