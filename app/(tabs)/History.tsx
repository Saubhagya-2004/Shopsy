import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useRouter } from "expo-router";
import {
  collection,
  getDocs,
  getFirestore,
  query,
  where,
} from "firebase/firestore";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function History() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isGuest, setIsGuest] = useState(true);
  const [booking, setBooking] = useState<{ id: string;[key: string]: any }[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const db = getFirestore();

  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        setLoading(true);
        const guestFlag = await AsyncStorage.getItem("isguest");
        const email = await AsyncStorage.getItem("userEmail");
        const guest = guestFlag === "true" || !email || email === "guest";
        setIsGuest(guest);
        setUserEmail(email);

        if (!guest && email) {
          try {
            const bookingCollection = collection(db, "bookings");
            const bookingQuery = query(
              bookingCollection,
              where("email", "==", email),
            );
            const snapshot = await getDocs(bookingQuery);
            const data = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
            setBooking(data);
          } catch (err) {
            console.log("Error fetching bookings:", err);
          }
        }
        setLoading(false);
      };
      fetchData();
    }, []),
  );

  // ── Format date nicely ──────────────────────────────────────────────────
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  // ── Booking Card ────────────────────────────────────────────────────────
  const renderBookingCard = ({
    item,
  }: {
    item: { id: string;[key: string]: any };
  }) => (
    <View
      className="bg-white rounded-2xl mx-4 mb-4 overflow-hidden"
      style={{
        elevation: 4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      }}
    >
      {/* Card Header */}
      <View className="bg-slate-800 px-4 py-3 flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <Ionicons name="restaurant" size={18} color="#fbbf24" />
          <Text
            className="text-white text-base font-bold flex-shrink-1"
            numberOfLines={1}
          >
            {item.restaurantName || "Restaurant"}
          </Text>
        </View>
        <View className="bg-amber-400/20 rounded-lg px-2.5 py-1">
          <Text className="text-amber-400 text-xs font-bold">CONFIRMED</Text>
        </View>
      </View>

      {/* Card Body */}
      <View className="px-4 py-3">
        {/* Date & Time Row */}
        <View className="flex-row items-center mb-3">
          <View className="flex-row items-center flex-1">
            <View className="w-8 h-8 rounded-full bg-orange-50 items-center justify-center mr-2.5">
              <Ionicons name="calendar-outline" size={16} color="#f97316" />
            </View>
            <View>
              <Text className="text-slate-400 text-xs">Date</Text>
              <Text className="text-slate-800 text-sm font-semibold">
                {formatDate(item.date) || "—"}
              </Text>
            </View>
          </View>
          <View className="flex-row items-center flex-1">
            <View className="w-8 h-8 rounded-full bg-blue-50 items-center justify-center mr-2.5">
              <Ionicons name="time-outline" size={16} color="#3b82f6" />
            </View>
            <View>
              <Text className="text-slate-400 text-xs">Time Slot</Text>
              <Text className="text-slate-800 text-sm font-semibold">
                {item.slot || "—"}
              </Text>
            </View>
          </View>
        </View>

        {/* Divider */}
        <View className="h-px bg-slate-100 my-1" />

        {/* Guests Row */}
        <View className="flex-row items-center mt-2.5">
          <View className="w-8 h-8 rounded-full bg-green-50 items-center justify-center mr-2.5">
            <Ionicons name="people-outline" size={16} color="#22c55e" />
          </View>
          <View>
            <Text className="text-slate-400 text-xs">Guests</Text>
            <Text className="text-slate-800 text-sm font-semibold">
              {item.guests || "—"}{" "}
              {item.guests === 1 ? "Person" : "People"}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );

  // ── Guest View ──────────────────────────────────────────────────────────
  if (isGuest && !loading) {
    return (
      <SafeAreaView className="flex-1 bg-[#d1bea7]">
        <StatusBar backgroundColor="#1e293b" barStyle="light-content" />

        {/* Header */}
        <View className="bg-slate-800 pt-8 pb-16 px-6 rounded-b-[32px]">
          <Text className="text-white text-xl font-bold text-center">
            Booking History
          </Text>
        </View>

        {/* Guest CTA Card */}
        <View className="flex-1 justify-center px-6 -mt-8">
          <View
            className="bg-white rounded-3xl px-6 pt-10 pb-8 items-center"
            style={{
              elevation: 8,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.15,
              shadowRadius: 12,
            }}
          >
            {/* Icon */}
            <View
              className="bg-slate-800 w-20 h-20 rounded-full items-center justify-center mb-5 border-4 border-orange-400"
              style={{
                elevation: 6,
                shadowColor: "#fb923c",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
              }}
            >
              <Ionicons name="time" size={36} color="#fbbf24" />
            </View>

            <Text className="text-slate-800 text-xl font-bold text-center">
              No Booking History
            </Text>
            <Text className="text-slate-400 text-sm text-center mt-2 px-4 leading-5">
              Create an account to track your reservations and access your
              booking history anytime.
            </Text>

            {/* Divider */}
            <View className="h-px w-full bg-slate-100 my-6" />

            {/* Sign In Button */}
            <TouchableOpacity
              onPress={() => router.push("/Signin")}
              activeOpacity={0.85}
              className="bg-slate-800 w-full py-4 rounded-2xl border-2 border-orange-400 flex-row items-center justify-center gap-2 mb-3"
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

            {/* Create Account Button */}
            <TouchableOpacity
              onPress={() => router.push("/Signup")}
              activeOpacity={0.85}
              className="bg-green-600 w-full py-4 rounded-2xl flex-row items-center justify-center gap-2"
              style={{
                elevation: 4,
                shadowColor: "#22c55e",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 6,
              }}
            >
              <Ionicons name="person-add-outline" size={20} color="#fff" />
              <Text className="text-white text-base font-bold">
                Create Account
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // ── Loading State ───────────────────────────────────────────────────────
  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-[#d1bea7] items-center justify-center">
        <StatusBar backgroundColor="#1e293b" barStyle="light-content" />
        <ActivityIndicator size="large" color="#f97316" />
        <Text className="text-slate-600 mt-3 text-sm">
          Loading your bookings...
        </Text>
      </SafeAreaView>
    );
  }

  // ── Logged-in View ──────────────────────────────────────────────────────
  return (
    <SafeAreaView className="flex-1 bg-[#d1bea7]">
      <StatusBar backgroundColor="#1e293b" barStyle="light-content" />

      {/* Header */}
      <View className="bg-slate-800 pt-8 pb-16 px-6 rounded-b-[32px]">
        <Text className="text-white text-xl font-bold text-center">
          Booking History
        </Text>
        <Text className="text-slate-400 text-sm text-center mt-1">
          Your past reservations
        </Text>
      </View>

      {/* Stats Badge */}
      <View className="items-center -mt-6 mb-4 px-4">
        <View
          className="bg-white rounded-2xl px-6 py-3 flex-row items-center gap-3"
          style={{
            elevation: 6,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
          }}
        >
          <View className="bg-orange-50 w-10 h-10 rounded-full items-center justify-center">
            <Ionicons name="receipt-outline" size={20} color="#f97316" />
          </View>
          <View>
            <Text className="text-slate-800 text-lg font-bold">
              {booking.length}
            </Text>
            <Text className="text-slate-400 text-xs">
              Total {booking.length === 1 ? "Booking" : "Bookings"}
            </Text>
          </View>
        </View>
      </View>

      {/* Booking List */}
      {booking.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <View className="bg-slate-100 w-20 h-20 rounded-full items-center justify-center mb-4">
            <Ionicons name="calendar-outline" size={36} color="#94a3b8" />
          </View>
          <Text className="text-slate-700 text-lg font-bold text-center">
            No Bookings Yet
          </Text>
          <Text className="text-slate-400 text-sm text-center mt-2">
            Your restaurant reservations will appear here once you make a
            booking.
          </Text>
          <TouchableOpacity
            onPress={() => router.push("/Home")}
            activeOpacity={0.85}
            className="bg-green-600 px-8 py-3.5 rounded-2xl mt-6 flex-row items-center gap-2"
            style={{ elevation: 3 }}
          >
            <Ionicons name="search-outline" size={18} color="#fff" />
            <Text className="text-white text-base font-bold">
              Explore Restaurants
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={booking}
          keyExtractor={(item) => item.id}
          renderItem={renderBookingCard}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: 8, paddingBottom: 30 }}
        />
      )}
    </SafeAreaView>
  );
}
