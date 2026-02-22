import { db } from "@/config/firebaseconfig";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { addDoc, collection, doc, getDoc } from "firebase/firestore";
import { Formik } from "formik";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Linking,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  carouselImages,
  restaurants as localRestaurants,
  slots,
} from "../../store/resturants";
import validationSchema from "../utils/guestformSubmit";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// ─── Carousel Arrow ──────────────────────────────────────────────────────────
const CarouselArrow = ({
  direction,
  onPress,
}: {
  direction: "left" | "right";
  onPress: () => void;
}) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.8}
    className="w-9 h-9 rounded-full bg-black/45 border-2 border-orange-400 items-center justify-center"
  >
    <Ionicons
      name={direction === "left" ? "chevron-back" : "chevron-forward"}
      size={18}
      color="#fb923c"
    />
  </TouchableOpacity>
);

// ─── Guest Booking Modal ─────────────────────────────────────────────────────
const GuestBookingModal = ({
  visible,
  onClose,
  onSubmit,
  selectedSlot,
  selectedDate,
  guestCount,
  restaurantName,
}: {
  visible: boolean;
  onClose: () => void;
  onSubmit: (values: any) => void;
  selectedSlot: string | null;
  selectedDate: Date;
  guestCount: number;
  restaurantName?: string;
}) => {
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        damping: 20,
        stiffness: 200,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const formatDate = (date: Date) =>
    date.toLocaleDateString("en-US", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={onClose}
        className="flex-1 bg-black/70 justify-end"
      >
        <TouchableOpacity activeOpacity={1}>
          <Animated.View
            style={{ transform: [{ translateY: slideAnim }] }}
            className="bg-slate-950 rounded-t-3xl border-t-2 border-l border-r border-orange-400 pb-10 overflow-hidden"
          >
            {/* Orange accent bar */}
            <View className="h-0.5 bg-orange-400" />

            {/* Header */}
            <View className="px-6 pt-5 pb-4 flex-row items-center justify-between border-b border-orange-400/15">
              <View>
                <Text className="text-orange-400 text-xs font-bold tracking-widest uppercase">
                  Guest Checkout
                </Text>
                <Text className="text-slate-50 text-xl font-extrabold mt-0.5">
                  Complete Booking
                </Text>
              </View>
              <TouchableOpacity
                onPress={onClose}
                className="w-9 h-9 rounded-full bg-orange-400/10 border border-orange-400/30 items-center justify-center"
              >
                <Ionicons name="close" size={18} color="#fb923c" />
              </TouchableOpacity>
            </View>

            {/* Order Summary Card */}
            <View className="mx-6 mt-4 bg-orange-400/5 rounded-2xl border border-orange-400/20 p-4">
              <Text className="text-orange-400 text-xs font-bold tracking-widest uppercase mb-3">
                Reservation Summary
              </Text>

              {/* Restaurant */}
              <View className="flex-row items-center justify-between mb-2">
                <View className="flex-row items-center gap-2">
                  <View className="w-6 h-6 rounded-md bg-orange-400/15 items-center justify-center">
                    <Text className="text-xs">🍽️</Text>
                  </View>
                  <Text className="text-slate-400 text-sm">Restaurant</Text>
                </View>
                <Text className="text-slate-50 text-sm font-semibold" numberOfLines={1}>
                  {restaurantName || "—"}
                </Text>
              </View>

              {/* Date */}
              <View className="flex-row items-center justify-between mb-2">
                <View className="flex-row items-center gap-2">
                  <View className="w-6 h-6 rounded-md bg-orange-400/15 items-center justify-center">
                    <Text className="text-xs">📅</Text>
                  </View>
                  <Text className="text-slate-400 text-sm">Date</Text>
                </View>
                <Text className="text-slate-50 text-sm font-semibold">
                  {formatDate(selectedDate)}
                </Text>
              </View>

              {/* Time */}
              <View className="flex-row items-center justify-between mb-2">
                <View className="flex-row items-center gap-2">
                  <View className="w-6 h-6 rounded-md bg-orange-400/15 items-center justify-center">
                    <Text className="text-xs">🕐</Text>
                  </View>
                  <Text className="text-slate-400 text-sm">Time</Text>
                </View>
                <Text className="text-orange-400 text-sm font-bold">{selectedSlot}</Text>
              </View>

              <View className="h-px bg-orange-400/15 my-2" />

              {/* Guests */}
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-2">
                  <View className="w-6 h-6 rounded-md bg-orange-400/15 items-center justify-center">
                    <Text className="text-xs">👥</Text>
                  </View>
                  <Text className="text-slate-400 text-sm">Guests</Text>
                </View>
                <Text className="text-slate-50 text-sm font-semibold">
                  {guestCount} {guestCount === 1 ? "Guest" : "Guests"}
                </Text>
              </View>
            </View>

            {/* Form */}
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
              <Formik
                initialValues={{ fullName: "", mobileNumber: "" }}
                validationSchema={validationSchema}
                onSubmit={onSubmit}
              >
                {({ values, handleBlur, handleChange, handleSubmit, touched, errors }) => (
                  <View className="px-6 pt-5">
                    <Text className="text-orange-400 text-xs font-bold tracking-widest uppercase mb-3">
                      Your Details
                    </Text>

                    {/* Full Name */}
                    <View className="mb-3">
                      <Text className="text-slate-400 text-xs font-semibold mb-1.5 tracking-wide">
                        Full Name
                      </Text>
                      <View
                        className={`flex-row items-center bg-white/5 rounded-xl px-3.5 h-12 gap-2.5 border ${
                          touched.fullName && errors.fullName
                            ? "border-red-500"
                            : "border-orange-400/25"
                        }`}
                      >
                        <Ionicons name="person-outline" size={16} color="#64748b" />
                        <TextInput
                          value={values.fullName}
                          onChangeText={handleChange("fullName")}
                          onBlur={handleBlur("fullName")}
                          placeholder="John Doe"
                          placeholderTextColor="#475569"
                          className="flex-1 text-slate-50 text-sm"
                        />
                      </View>
                      {touched.fullName && errors.fullName && (
                        <Text className="text-red-500 text-xs mt-1 ml-1">{errors.fullName}</Text>
                      )}
                    </View>

                    {/* Mobile Number */}
                    <View className="mb-3">
                      <Text className="text-slate-400 text-xs font-semibold mb-1.5 tracking-wide">
                        Mobile Number
                      </Text>
                      <View
                        className={`flex-row items-center bg-white/5 rounded-xl px-3.5 h-12 gap-2.5 border ${
                          touched.mobileNumber && errors.mobileNumber
                            ? "border-red-500"
                            : "border-orange-400/25"
                        }`}
                      >
                        <Ionicons name="call-outline" size={16} color="#64748b" />
                        <TextInput
                          value={values.mobileNumber}
                          onChangeText={handleChange("mobileNumber")}
                          onBlur={handleBlur("mobileNumber")}
                          placeholder="+1 234 567 8900"
                          placeholderTextColor="#475569"
                          keyboardType="phone-pad"
                          className="flex-1 text-slate-50 text-sm"
                        />
                      </View>
                      {touched.mobileNumber && errors.mobileNumber && (
                        <Text className="text-red-500 text-xs mt-1 ml-1">{errors.mobileNumber}</Text>
                      )}
                    </View>


                    {/* Submit */}
                    <TouchableOpacity
                      onPress={() => handleSubmit()}
                      activeOpacity={0.85}
                      className="bg-orange-400 rounded-2xl h-14 flex-row items-center justify-center gap-2"
                    >
                      <Ionicons name="checkmark-circle" size={20} color="#0f172a" />
                      <Text className="text-slate-950 text-base font-extrabold tracking-wide">
                        Confirm Reservation
                      </Text>
                    </TouchableOpacity>

                    <Text className="text-slate-500 text-xs text-center mt-3">
                      No account needed · Confirmation sent to your email
                    </Text>
                  </View>
                )}
              </Formik>
            </KeyboardAvoidingView>
          </Animated.View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

// ─── Main Screen ─────────────────────────────────────────────────────────────
export default function RestaurantDetail() {
  const { restaurant } = useLocalSearchParams();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeSlide, setActiveSlide] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const carouselRef = useRef<FlatList>(null);
  const [modalvisible, setModalvisible] = useState(false);

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDateModal, setShowDateModal] = useState(false);
  const [tempDate, setTempDate] = useState(new Date());
  const [guestCount, setGuestCount] = useState(2);

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

  useEffect(() => {
    if (images.length <= 1) return;
    const timer = setInterval(() => {
      setActiveSlide((prev) => {
        const next = (prev + 1) % images.length;
        carouselRef.current?.scrollToIndex({ index: next, animated: true });
        return next;
      });
    }, 3000);
    return () => clearInterval(timer);
  }, [images.length]);

  const goToPrev = useCallback(() => {
    setActiveSlide((prev) => {
      const next = prev === 0 ? images.length - 1 : prev - 1;
      carouselRef.current?.scrollToIndex({ index: next, animated: true });
      return next;
    });
  }, [images.length]);

  const goToNext = useCallback(() => {
    setActiveSlide((prev) => {
      const next = (prev + 1) % images.length;
      carouselRef.current?.scrollToIndex({ index: next, animated: true });
      return next;
    });
  }, [images.length]);

  const onViewableItemsChanged = useCallback(({ viewableItems }: any) => {
    if (viewableItems.length > 0) setActiveSlide(viewableItems[0].index ?? 0);
  }, []);

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

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

  return (
    <>
      <StatusBar barStyle="light-content" />
      <ScrollView className="flex-1 bg-slate-950" showsVerticalScrollIndicator={false}>

        {/* ── CAROUSEL ──────────────────────────────────────────────── */}
        <View style={{ width: SCREEN_WIDTH, height: 320 }} className="bg-slate-800">
          {images.length > 0 ? (
            <>
              <FlatList
                ref={carouselRef}
                data={images}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                keyExtractor={(_, i) => i.toString()}
                getItemLayout={(_, i) => ({
                  length: SCREEN_WIDTH,
                  offset: SCREEN_WIDTH * i,
                  index: i,
                })}
                onViewableItemsChanged={onViewableItemsChanged}
                viewabilityConfig={viewabilityConfig}
                renderItem={({ item: uri }: { item: string }) => (
                  <Image
                    source={{ uri }}
                    style={{ width: SCREEN_WIDTH, height: 320 }}
                    resizeMode="cover"
                  />
                )}
              />

              {images.length > 1 && (
                <>
                  <View className="absolute left-3 top-1/2 -translate-y-4">
                    <CarouselArrow direction="left" onPress={goToPrev} />
                  </View>
                  <View className="absolute right-3 top-1/2 -translate-y-4">
                    <CarouselArrow direction="right" onPress={goToNext} />
                  </View>
                </>
              )}

              {/* Dots */}
              <View className="absolute bottom-4 self-center flex-row items-center gap-1.5">
                {images.map((_: any, i: number) => (
                  <TouchableOpacity
                    key={i}
                    onPress={() => {
                      carouselRef.current?.scrollToIndex({ index: i, animated: true });
                      setActiveSlide(i);
                    }}
                    className={`rounded-full h-2 ${
                      i === activeSlide ? "w-5 bg-orange-400" : "w-2 bg-white/50"
                    }`}
                  />
                ))}
              </View>

              {/* Counter */}
              <View className="absolute top-4 right-4 bg-black/55 px-2.5 py-1 rounded-full">
                <Text className="text-white text-xs font-semibold">
                  {activeSlide + 1} / {images.length}
                </Text>
              </View>
            </>
          ) : data.image ? (
            <Image
              source={{ uri: data.image }}
              style={{ width: SCREEN_WIDTH, height: 320 }}
              resizeMode="cover"
            />
          ) : null}

          {/* Back Button */}
          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.8}
            className="absolute top-12 left-4 z-30 w-10 h-10 rounded-full bg-black/50 border-2 border-orange-400 items-center justify-center"
          >
            <Ionicons name="arrow-back" size={20} color="#fb923c" />
          </TouchableOpacity>
        </View>

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
                    className={`py-2.5 px-4 rounded-xl border-2 bg-slate-800 ${
                      isSelected ? "border-orange-400" : "border-white/10"
                    }`}
                  >
                    <Text
                      className={`text-sm ${
                        isSelected ? "text-orange-400 font-bold" : "text-slate-400"
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
                    className={`w-11 h-11 rounded-full items-center justify-center border ${
                      guestCount <= 1
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
                    className={`w-11 h-11 rounded-full items-center justify-center border ${
                      guestCount >= 12
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

      {/* ── DATE MODAL ──────────────────────────────────────────────── */}
      <Modal
        visible={showDateModal}
        transparent
        animationType="fade"
        onRequestClose={handleDateCancel}
      >
        <View className="flex-1 bg-black/60 justify-center p-5">
          <View className="bg-slate-800 rounded-3xl p-5 border border-orange-400/30">
            <Text className="text-slate-50 text-lg font-bold mb-4 text-center">
              Select Date
            </Text>
            {Platform.OS === "ios" ? (
              <DateTimePicker
                value={tempDate}
                mode="date"
                display="spinner"
                onChange={(_, date) => date && setTempDate(date)}
                minimumDate={new Date()}
                textColor="#f8fafc"
              />
            ) : (
              <DateTimePicker
                value={tempDate}
                mode="date"
                display="default"
                onChange={(_, date) => {
                  if (date) {
                    setTempDate(date);
                    setSelectedDate(date);
                    setShowDateModal(false);
                  }
                }}
                minimumDate={new Date()}
              />
            )}
            {Platform.OS === "ios" && (
              <View className="flex-row gap-3 mt-4">
                <TouchableOpacity
                  onPress={handleDateCancel}
                  className="flex-1 py-3 rounded-xl border border-white/15 items-center"
                >
                  <Text className="text-slate-400 font-semibold">Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleDateConfirm}
                  className="flex-1 py-3 rounded-xl bg-orange-400 items-center"
                >
                  <Text className="text-slate-950 font-bold">Confirm</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>

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