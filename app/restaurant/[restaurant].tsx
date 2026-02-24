import { db } from "@/config/firebaseconfig";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import { addDoc, collection, doc, getDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import DatePickerModal from "../../components/restaurant/DatePickerModal";
import GuestBookingModal from "../../components/restaurant/GuestBookingModal";
import ImageCarousel from "../../components/restaurant/ImageCarousel";
import {
  carouselImages,
  restaurants as localRestaurants,
  slots,
} from "../../store/resturants";

export default function RestaurantDetail() {
  const { restaurant } = useLocalSearchParams();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [modalvisible, setModalvisible] = useState(false);

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDateModal, setShowDateModal] = useState(false);
  const [tempDate, setTempDate] = useState(new Date());
  const [guestCount, setGuestCount] = useState(2);

  // ─── Fetch restaurant data ───────────────────────────────────────────────
  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        const docRef = doc(db, "restaurants", restaurant as string);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) setData({ id: docSnap.id, ...docSnap.data() });
      } catch (e) {
        console.log(e);
      } finally {
        setLoading(false);
      }
    };
    if (restaurant) fetchRestaurant();
  }, [restaurant]);

  // ─── Derived data ────────────────────────────────────────────────────────
  const matchIndex = data
    ? (localRestaurants as any[]).findIndex((r: any) => r.name === data.name)
    : -1;
  const images =
    matchIndex >= 0 && matchIndex < carouselImages.length
      ? (carouselImages[matchIndex] as any).images
      : [];
  const timeSlots =
    matchIndex >= 0 && matchIndex < slots.length
      ? (slots[matchIndex] as any).slot
      : [];

  // ─── Helpers ─────────────────────────────────────────────────────────────
  const formatDate = (date: Date) =>
    date.toLocaleDateString("en-US", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  const handleDateConfirm = () => {
    setSelectedDate(tempDate);
    setShowDateModal(false);
  };

  const handleDateCancel = () => {
    setTempDate(selectedDate);
    setShowDateModal(false);
  };

  const handleGetDirections = () => {
    if (!data?.address) return;
    const encoded = encodeURIComponent(data.address);
    const hasCoords = data.latitude !== undefined && data.longitude !== undefined;
    const destination = hasCoords ? `${data.latitude},${data.longitude}` : encoded;
    const iosUrl = `maps://?saddr=Current+Location&daddr=${destination}`;
    const androidUrl = hasCoords
      ? `google.navigation:q=${data.latitude},${data.longitude}&mode=d`
      : `google.navigation:q=${encoded}&mode=d`;
    const webFallback = hasCoords
      ? `https://www.google.com/maps/dir/?api=1&destination=${data.latitude},${data.longitude}&travelmode=driving`
      : `https://www.google.com/maps/dir/?api=1&destination=${encoded}&travelmode=driving`;
    const url = Platform.OS === "ios" ? iosUrl : androidUrl;
    Linking.canOpenURL(url)
      .then((supported) => Linking.openURL(supported ? url : webFallback))
      .catch(() => Linking.openURL(webFallback));
  };

  // ─── Booking handlers ────────────────────────────────────────────────────
  const handlebooking = async () => {
    if (!selectedSlot) return;
    const userEmail = await AsyncStorage.getItem("userEmail");
    const guestStatus = await AsyncStorage.getItem("isguest");

    if (!userEmail && guestStatus !== "true") {
      Alert.alert("Please login first");
      return;
    }

    if (userEmail) {
      try {
        await addDoc(collection(db, "bookings"), {
          email: userEmail,
          slot: selectedSlot,
          date: selectedDate.toISOString(),
          restaurantName: data.name,
          guests: guestCount,
        });
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          setSelectedSlot(null);
        }, 3000);
      } catch (error) {
        console.log("Firestore Error:", error);
        Alert.alert("Booking Failed. Check console.");
      }
    } else if (guestStatus === "true") {
      setModalvisible(true);
    }
  };

  const handleSubmitForm = async (values: any) => {
    try {
      await addDoc(collection(db, "bookings"), {
        fullName: values.fullName,
        mobileNumber: values.mobileNumber,
        slot: selectedSlot,
        date: selectedDate.toISOString(),
        restaurantName: data?.name,
        guests: guestCount,
        isGuest: true,
      });
      setModalvisible(false);
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setSelectedSlot(null);
      }, 3000);
    } catch (error) {
      console.log("Firestore Error:", error);
      Alert.alert("Booking Failed. Please try again.");
    }
  };

  // ─── Loading / Error states ──────────────────────────────────────────────
  if (loading) {
    return (
      <View className="flex-1 bg-slate-950 items-center justify-center">
        <ActivityIndicator size="large" color="#fb923c" />
      </View>
    );
  }

  if (!data) {
    return (
      <View className="flex-1 bg-slate-950 items-center justify-center">
        <Text className="text-slate-400">Restaurant not found</Text>
      </View>
    );
  }

  // ─── Render ──────────────────────────────────────────────────────────────
  return (
    <>
      <StatusBar barStyle="light-content" />
      <ScrollView className="flex-1 bg-slate-950" showsVerticalScrollIndicator={false}>

        {/* ── CAROUSEL ──────────────────────────────────────────────── */}
        <ImageCarousel images={images} fallbackImage={data.image} />

        {/* ── NAME + ADDRESS ─────────────────────────────────────────── */}
        <View className="px-5 pt-5 pb-1">
          <Text className="text-slate-50 text-2xl font-extrabold">{data.name}</Text>
          <Text className="text-slate-500 text-sm mt-1">{data.address}</Text>
        </View>

        {/* ── INFO CARD ──────────────────────────────────────────────── */}
        <View className="mx-4 mt-4 bg-slate-800 rounded-2xl p-4 border border-orange-400/15">
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-1 flex-row items-center gap-2">
              <Ionicons name="location-outline" size={16} color="#fb923c" />
              <Text className="text-slate-400 text-sm flex-1" numberOfLines={2}>
                {data.address}
              </Text>
            </View>
            <TouchableOpacity
              onPress={handleGetDirections}
              className="bg-orange-400 px-3 py-1.5 rounded-lg ml-2"
            >
              <Text className="text-slate-950 text-xs font-bold">Directions</Text>
            </TouchableOpacity>
          </View>

          {(data.opening || data.closing) && (
            <View className="flex-row items-center gap-2 mb-2">
              <Ionicons name="time-outline" size={16} color="#fb923c" />
              <Text className="text-slate-400 text-sm">
                {data.opening} – {data.closing}
              </Text>
            </View>
          )}

          {data.seats && (
            <View className="flex-row items-center gap-2">
              <Ionicons name="people-outline" size={16} color="#fb923c" />
              <Text className="text-slate-400 text-sm">{data.seats} seats available</Text>
            </View>
          )}
        </View>

        {/* ── TIME SLOTS ─────────────────────────────────────────────── */}
        {timeSlots.length > 0 && (
          <View className="mx-4 mt-5">
            <Text className="text-slate-50 text-lg font-bold mb-4">Find Available Slots</Text>

            {/* Date Selector */}
            <TouchableOpacity
              onPress={() => { setTempDate(selectedDate); setShowDateModal(true); }}
              className="bg-slate-800 border border-orange-400/30 px-4 py-3 rounded-2xl mb-4 flex-row items-center justify-between"
            >
              <View className="flex-row items-center gap-2">
                <Text className="text-base">📅</Text>
                <Text className="text-slate-50 text-sm font-medium">{formatDate(selectedDate)}</Text>
              </View>
              <Ionicons name="chevron-down" size={16} color="#fb923c" />
            </TouchableOpacity>

            {/* Slot Grid */}
            <View className="flex-row flex-wrap gap-2.5 mb-4">
              {timeSlots.map((time: string, i: number) => {
                const isSelected = selectedSlot === time;
                return (
                  <TouchableOpacity
                    key={i}
                    onPress={() => setSelectedSlot(isSelected ? null : time)}
                    activeOpacity={0.8}
                    className={`py-2.5 px-4 rounded-xl border-2 bg-slate-800 ${isSelected ? "border-orange-400" : "border-white/10"
                      }`}
                  >
                    <Text
                      className={`text-sm ${isSelected ? "text-orange-400 font-bold" : "text-slate-400"
                        }`}
                    >
                      {time}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Guest Selector */}
            {selectedSlot && (
              <View className="bg-slate-800 rounded-2xl p-4 border border-orange-400/20 mb-4">
                <Text className="text-slate-400 text-xs font-semibold tracking-widest uppercase mb-3">
                  Number of Guests
                </Text>
                <View className="flex-row items-center justify-between">
                  <TouchableOpacity
                    onPress={() => guestCount > 1 && setGuestCount(guestCount - 1)}
                    disabled={guestCount <= 1}
                    className={`w-11 h-11 rounded-full items-center justify-center border ${guestCount <= 1
                      ? "bg-white/5 border-transparent"
                      : "bg-orange-400/15 border-orange-400"
                      }`}
                  >
                    <Ionicons
                      name="remove"
                      size={20}
                      color={guestCount <= 1 ? "#475569" : "#fb923c"}
                    />
                  </TouchableOpacity>

                  <View className="items-center">
                    <Text className="text-slate-50 text-3xl font-extrabold">{guestCount}</Text>
                    <Text className="text-slate-500 text-xs">
                      {guestCount === 1 ? "Guest" : "Guests"}
                    </Text>
                  </View>

                  <TouchableOpacity
                    onPress={() => guestCount < 12 && setGuestCount(guestCount + 1)}
                    disabled={guestCount >= 12}
                    className={`w-11 h-11 rounded-full items-center justify-center border ${guestCount >= 12
                      ? "bg-white/5 border-transparent"
                      : "bg-orange-400/15 border-orange-400"
                      }`}
                  >
                    <Ionicons
                      name="add"
                      size={20}
                      color={guestCount >= 12 ? "#475569" : "#fb923c"}
                    />
                  </TouchableOpacity>
                </View>
                <Text className="text-slate-500 text-xs text-center mt-2.5">
                  Maximum 12 guests
                </Text>
              </View>
            )}

            {/* Book Button */}
            {selectedSlot && (
              <TouchableOpacity
                onPress={handlebooking}
                activeOpacity={0.85}
                className="mb-8 bg-slate-800 rounded-2xl py-4 border-2 border-orange-400 flex-row items-center justify-center gap-2"
              >
                <Ionicons name="calendar-outline" size={18} color="#fb923c" />
                <Text className="text-orange-400 text-base font-bold">
                  Book for {guestCount} {guestCount === 1 ? "guest" : "guests"} at {selectedSlot}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>

      {/* ── GUEST BOOKING MODAL ─────────────────────────────────────── */}
      <GuestBookingModal
        visible={modalvisible}
        onClose={() => setModalvisible(false)}
        onSubmit={handleSubmitForm}
        selectedSlot={selectedSlot}
        selectedDate={selectedDate}
        guestCount={guestCount}
        restaurantName={data?.name}
      />

      {/* ── DATE PICKER ─────────────────────────────────────────────── */}
      <DatePickerModal
        visible={showDateModal}
        date={tempDate}
        onDateChange={(date) => {
          setTempDate(date);
          if (Platform.OS === "android") setSelectedDate(date);
        }}
        onConfirm={handleDateConfirm}
        onCancel={handleDateCancel}
      />

      {/* ── SUCCESS TOAST ────────────────────────────────────────────── */}
      {showSuccess && (
        <View className="absolute bottom-10 left-5 right-5 bg-slate-950 border border-orange-400 rounded-2xl p-4 flex-row items-center gap-3">
          <View className="w-9 h-9 rounded-full bg-orange-400/15 items-center justify-center">
            <Ionicons name="checkmark-circle" size={22} color="#fb923c" />
          </View>
          <View className="flex-1">
            <Text className="text-orange-400 font-bold text-sm">Booking Confirmed!</Text>
            <Text className="text-slate-400 text-xs mt-0.5">
              {guestCount} {guestCount === 1 ? "guest" : "guests"} · {selectedSlot} ·{" "}
              {formatDate(selectedDate)}
            </Text>
          </View>
        </View>
      )}
    </>
  );
}