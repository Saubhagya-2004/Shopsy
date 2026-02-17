import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  Linking,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  StatusBar,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/config/firebaseconfig";
import { Ionicons } from "@expo/vector-icons";
import {
  restaurants as localRestaurants,
  carouselImages,
  slots,
} from "../../store/resturants";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// ─── Carousel Arrow — orange ring, rounded, bg changes ───────────────────────
const CarouselArrow = ({
  direction,
  onPress,
}: {
  direction: "left" | "right";
  onPress: () => void;
}) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.7}
    className={`absolute top-1/2 -translate-y-5 z-20 w-10 h-10 rounded-full
      bg-black/50 border-2 border-orange-400 items-center justify-center
      ${direction === "left" ? "left-3" : "right-3"}`}
  >
    <Ionicons
      name={direction === "left" ? "chevron-back" : "chevron-forward"}
      size={22}
      color="#fb923c"
    />
  </TouchableOpacity>
);

export default function RestaurantDetail() {
  const { restaurant } = useLocalSearchParams();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeSlide, setActiveSlide] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const carouselRef = useRef<FlatList>(null);

  // ── Fetch ─────────────────────────────────────────────────────────────────
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

  // ── Auto-scroll ───────────────────────────────────────────────────────────
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

  // ── Navigation ────────────────────────────────────────────────────────────
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

  const viewabilityConfig = useRef({
    viewAreaCoveragePercentThreshold: 50,
  }).current;

  // ── FIX 1: Directions opens navigation FROM current location ──────────────
  const handleGetDirections = () => {
    if (!data?.address) return;

    const encoded = encodeURIComponent(data.address);
    const hasCoords =
      data.latitude !== undefined && data.longitude !== undefined;

    const destination = hasCoords
      ? `${data.latitude},${data.longitude}`
      : encoded;

    // iOS: Apple Maps with saddr=current location (origin), daddr=destination
    const iosUrl = `maps://?saddr=Current+Location&daddr=${destination}`;

    // Android: Google Maps navigation from current location to destination
    const androidUrl = hasCoords
      ? `google.navigation:q=${data.latitude},${data.longitude}&mode=d`
      : `google.navigation:q=${encoded}&mode=d`;

    // Web fallback: Google Maps directions with no origin = uses current location
    const webFallback = hasCoords
      ? `https://www.google.com/maps/dir/?api=1&destination=${data.latitude},${data.longitude}&travelmode=driving`
      : `https://www.google.com/maps/dir/?api=1&destination=${encoded}&travelmode=driving`;

    const url = Platform.OS === "ios" ? iosUrl : androidUrl;

    Linking.canOpenURL(url)
      .then((supported) => Linking.openURL(supported ? url : webFallback))
      .catch(() => Linking.openURL(webFallback));
  };

  // ── Booking ───────────────────────────────────────────────────────────────
  const handleBook = () => {
    if (!selectedSlot) return;
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-[#d1bea7] justify-center items-center">
        <ActivityIndicator size="large" color="orange" />
      </SafeAreaView>
    );
  }

  if (!data) {
    return (
      <SafeAreaView className="flex-1 bg-[#d1bea7] justify-center items-center">
        <Text className="text-base text-gray-700">Restaurant not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      <ScrollView
        className="flex-1 bg-[#d1bea7]"
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* ══════════════════════════════════════════════════════
            CAROUSEL — full bleed from top
        ══════════════════════════════════════════════════════ */}
        <View className="relative" style={{ height: 300 }}>

          {images.length > 0 ? (
            <>
              <FlatList
                ref={carouselRef}
                data={images}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onViewableItemsChanged={onViewableItemsChanged}
                viewabilityConfig={viewabilityConfig}
                keyExtractor={(_: any, i: number) => i.toString()}
                getItemLayout={(_: any, i: number) => ({
                  length: SCREEN_WIDTH,
                  offset: SCREEN_WIDTH * i,
                  index: i,
                })}
                renderItem={({ item: uri }: { item: string }) => (
                  <Image
                    source={{ uri }}
                    style={{ width: SCREEN_WIDTH, height: 300 }}
                    resizeMode="cover"
                  />
                )}
              />

              {/* FIX 2: Arrows — orange ring, rounded, centered vertically */}
              {images.length > 1 && (
                <>
                  <CarouselArrow direction="left" onPress={goToPrev} />
                  <CarouselArrow direction="right" onPress={goToNext} />
                </>
              )}

              {/* Dot Indicators */}
              <View className="absolute bottom-3 w-full flex-row justify-center items-center gap-1.5 z-10">
                {images.map((_: any, i: number) => (
                  <TouchableOpacity
                    key={i}
                    onPress={() => {
                      carouselRef.current?.scrollToIndex({ index: i, animated: true });
                      setActiveSlide(i);
                    }}
                    className={`rounded-full ${
                      i === activeSlide
                        ? "w-5 h-2 bg-orange-400"
                        : "w-2 h-2 bg-white/50"
                    }`}
                  />
                ))}
              </View>

              {/* Image counter */}
              <View className="absolute top-12 right-4 bg-black/50 rounded-full px-3 py-1 z-30">
                <Text className="text-white text-xs font-semibold">
                  {activeSlide + 1} / {images.length}
                </Text>
              </View>
            </>
          ) : data.image ? (
            <Image
              source={{ uri: data.image }}
              style={{ width: SCREEN_WIDTH, height: 300 }}
              resizeMode="cover"
            />
          ) : null}

          {/* Back Button — orange ring, matches arrow style */}
          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.8}
            className="absolute top-12 left-4 z-30 w-10 h-10 rounded-full
              bg-black/50 border-2 border-orange-400 items-center justify-center"
          >
            <Ionicons name="arrow-back" size={20} color="#fb923c" />
          </TouchableOpacity>
        </View>

        {/* ══════════════════════════════════════════════════════
            FIX 3 & 4: Name + Address UNDER carousel, BEFORE card
            with gap from carousel
        ══════════════════════════════════════════════════════ */}
        <View className="px-5 pt-5 pb-2">
          <Text className="text-2xl font-bold text-slate-800" numberOfLines={1}>
            {data.name}
          </Text>
          <View className="flex-row items-center gap-1.5 mt-1">
            <Ionicons name="location-outline" size={14} color="#EA4335" />
            <Text className="text-sm text-slate-500 flex-1" numberOfLines={2}>
              {data.address}
            </Text>
          </View>
        </View>

        {/* ══════════════════════════════════════════════════════
            INFO CARD — below name/address with gap
        ══════════════════════════════════════════════════════ */}
        <View className="mx-4 mt-3 rounded-3xl bg-white px-6 py-5 shadow-lg">

          {/* Gold accent */}
          <View className="h-0.5 w-10 bg-orange-400 rounded-full mb-4" />

          {/* Address row + Directions */}
          <View className="flex-row items-start justify-between gap-3 mb-3">
            <View className="flex-row items-start gap-2 flex-1">
              <Ionicons
                name="map-outline"
                size={16}
                color="#94a3b8"
                style={{ marginTop: 2 }}
              />
              <Text className="text-sm text-slate-500 flex-1 leading-5">
                {data.address}
              </Text>
            </View>

            {/* FIX 1: Directions — navigates FROM current location */}
            <TouchableOpacity
              onPress={handleGetDirections}
              activeOpacity={0.8}
              className="flex-row items-center gap-1.5 bg-slate-800 px-3 py-2
                rounded-xl border border-orange-400"
            >
              <Ionicons name="navigate" size={14} color="#fb923c" />
              <Text className="text-orange-400 text-xs font-bold">
                Directions
              </Text>
            </TouchableOpacity>
          </View>

          {/* Divider */}
          <View className="h-px bg-slate-100 mb-3" />

          {/* Hours */}
          {(data.opening || data.closing) && (
            <View className="flex-row items-center gap-2 mb-2">
              <Ionicons name="time-outline" size={16} color="cyan" />
              <Text className="text-sm text-slate-500">
                {data.opening}
                <Text className="text-slate-300"> – </Text>
                {data.closing}
              </Text>
            </View>
          )}

          {/* Seats */}
          {data.seats && (
            <View className="flex-row items-center gap-2">
              <Ionicons name="people-outline" size={16} color="green" />
              <Text className="text-sm text-slate-500">
                {data.seats} seats available
              </Text>
            </View>
          )}
        </View>

        {/* ══════════════════════════════════════════════════════
            TIME SLOTS
        ══════════════════════════════════════════════════════ */}
        {timeSlots.length > 0 && (
          <View className="mt-6 px-4">

            <View className="flex-row items-center gap-3 mb-4">
              <View className="w-1 h-6 bg-orange-400 rounded-full" />
              <Text className="text-lg font-bold text-slate-800">
                🕐 Available Slots
              </Text>
            </View>

            <View className="flex-row flex-wrap gap-3">
              {timeSlots.map((time: string, i: number) => {
                const isSelected = selectedSlot === time;
                return (
                  <TouchableOpacity
                    key={i}
                    onPress={() => setSelectedSlot(isSelected ? null : time)}
                    activeOpacity={0.8}
                    className={`py-2.5 px-5 rounded-xl border-2 ${
                      isSelected
                        ? "bg-slate-800 border-orange-400 shadow-md"
                        : "bg-white border-slate-200 shadow-sm"
                    }`}
                  >
                    <Text
                      className={`text-sm font-semibold ${
                        isSelected ? "text-orange-400" : "text-slate-600"
                      }`}
                    >
                      {time}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Book Button */}
            {selectedSlot && (
              <TouchableOpacity
                onPress={handleBook}
                activeOpacity={0.85}
                className="mt-6 bg-slate-800 rounded-2xl py-4 border-2 border-orange-400
                  flex-row items-center justify-center gap-2 shadow-lg"
              >
                <Ionicons name="calendar-outline" size={20} color="#fb923c" />
                <Text className="text-orange-400 text-base font-bold">
                  Book at {selectedSlot}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        <View className="h-14" />
      </ScrollView>

      {/* Success Toast */}
      {showSuccess && (
        <View className="absolute bottom-10 left-4 right-4 bg-green-600 py-3.5 px-5
          rounded-2xl flex-row items-center gap-3 z-50 shadow-xl">
          <Ionicons name="checkmark-circle" size={22} color="#fff" />
          <Text className="text-white font-semibold text-sm flex-1">
            Booking confirmed for {selectedSlot}!
          </Text>
        </View>
      )}
    </>
  );
} 