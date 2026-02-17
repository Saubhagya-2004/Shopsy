import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
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

// ─── Carousel Arrow Button ────────────────────────────────────────────────────
const CarouselArrow = ({
  direction,
  onPress,
}: {
  direction: "left" | "right";
  onPress: () => void;
}) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.75}
    className={`absolute top-1/2 -translate-y-5 z-20 w-10 h-10 rounded-full
      items-center justify-center border-2 border-yellow-400 bg-white/80
      ${direction === "left" ? "left-3" : "right-3"}`}
    style={{
      elevation: 6,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
    }}
  >
    <Ionicons
      name={direction === "left" ? "chevron-back" : "chevron-forward"}
      size={22}
      color="#1e293b"
    />
  </TouchableOpacity>
);

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function RestaurantDetail() {
  const { restaurant } = useLocalSearchParams();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeSlide, setActiveSlide] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const carouselRef = useRef<FlatList>(null);

  // ── Fetch restaurant ──────────────────────────────────────────────────────
  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        const docRef = doc(db, "restaurants", restaurant as string);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setData({ id: docSnap.id, ...docSnap.data() });
        }
      } catch (error) {
        console.log("Error fetching restaurant:", error);
      } finally {
        setLoading(false);
      }
    };
    if (restaurant) fetchRestaurant();
  }, [restaurant]);

  // ── Match local data ──────────────────────────────────────────────────────
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

  // ── Manual navigation ─────────────────────────────────────────────────────
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
    if (viewableItems.length > 0) {
      setActiveSlide(viewableItems[0].index ?? 0);
    }
  }, []);

  const viewabilityConfig = useRef({
    viewAreaCoveragePercentThreshold: 50,
  }).current;

  // ── Booking ───────────────────────────────────────────────────────────────
  const handleBook = () => {
    if (!selectedSlot) return;
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-[#d1bea7] justify-center items-center">
        <ActivityIndicator size="large" color="orange" />
      </SafeAreaView>
    );
  }

  // ── Not found ─────────────────────────────────────────────────────────────
  if (!data) {
    return (
      <SafeAreaView className="flex-1 bg-[#d1bea7] justify-center items-center">
        <Text className="text-base text-gray-700">Restaurant not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <>
      {/* Full-bleed transparent status bar */}
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      <ScrollView
        className="flex-1 bg-[#d1bea7]"
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* ════════════════════════════════════════════════════════════════
            CAROUSEL — edge-to-edge, starts at very top (no SafeArea)
        ════════════════════════════════════════════════════════════════ */}
        <View className="relative">
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
                    style={{ width: SCREEN_WIDTH, height: 360 }}
                    resizeMode="cover"
                  />
                )}
              />

              {/* Dark gradient overlay at bottom of carousel */}
              <View
                className="absolute bottom-0 left-0 right-0 h-28"
                pointerEvents="none"
              />

              {/* Left / Right Arrows */}
              {images.length > 1 && (
                <>
                  <CarouselArrow direction="left" onPress={goToPrev} />
                  <CarouselArrow direction="right" onPress={goToNext} />
                </>
              )}

              {/* Image counter pill — top right */}
              <View className="absolute top-14 right-4 bg-black/50 rounded-full px-3 py-1 border border-white/20">
                <Text className="text-white text-xs font-semibold">
                  {activeSlide + 1} / {images.length}
                </Text>
              </View>

              {/* Dot indicators — bottom centre */}
              <View className="absolute bottom-5 w-full flex-row justify-center items-center gap-1.5">
                {images.map((_: any, i: number) => (
                  <TouchableOpacity
                    key={i}
                    onPress={() => {
                      carouselRef.current?.scrollToIndex({ index: i, animated: true });
                      setActiveSlide(i);
                    }}
                    style={{
                      width: i === activeSlide ? 24 : 8,
                      height: 8,
                      borderRadius: 4,
                      backgroundColor:
                        i === activeSlide
                          ? "#ffd700"
                          : "rgba(255,255,255,0.55)",
                    }}
                  />
                ))}
              </View>
            </>
          ) : data.image ? (
            <Image
              source={{ uri: data.image }}
              style={{ width: SCREEN_WIDTH, height: 360 }}
              resizeMode="cover"
            />
          ) : null}

          {/* ── Back button — top left, over the image ── */}
          <TouchableOpacity
            onPress={() => router.back()}
            className="absolute top-14 left-4 z-30 w-10 h-10 rounded-full
              bg-white/80 border-2 border-yellow-400 items-center justify-center"
            style={{
              elevation: 6,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 4,
            }}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back" size={20} color="#1e293b" />
          </TouchableOpacity>
        </View>

        {/* ════════════════════════════════════════════════════════════════
            INFO CARD — overlaps the carousel by -mt-8
        ════════════════════════════════════════════════════════════════ */}
        <View
          className="mx-4 -mt-8 rounded-3xl bg-white px-6 py-5"
          style={{
            elevation: 10,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.15,
            shadowRadius: 12,
          }}
        >
          {/* Name */}
          <Text className="text-2xl font-bold text-slate-800">{data.name}</Text>

          {/* Gold divider */}
          <View className="h-[2px] w-12 bg-yellow-400 rounded-full mt-2 mb-4" />

          {/* Address */}
          <View className="flex-row items-start gap-2 mb-2">
            <Ionicons name="location-outline" size={17} color="#94a3b8" style={{ marginTop: 1 }} />
            <Text className="text-sm text-slate-500 flex-1 leading-5">
              {data.address}
            </Text>
          </View>

          {/* Hours */}
          {(data.opening || data.closing) && (
            <View className="flex-row items-center gap-2 mb-2">
              <Ionicons name="time-outline" size={17} color="#94a3b8" />
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
              <Ionicons name="people-outline" size={17} color="#94a3b8" />
              <Text className="text-sm text-slate-500">
                {data.seats} seats available
              </Text>
            </View>
          )}
        </View>

        {/* ════════════════════════════════════════════════════════════════
            TIME SLOTS
        ════════════════════════════════════════════════════════════════ */}
        {timeSlots.length > 0 && (
          <View className="mt-6 px-4">

            {/* Section heading */}
            <View className="flex-row items-center gap-3 mb-4">
              <View className="w-1 h-6 bg-yellow-400 rounded-full" />
              <Text className="text-lg font-bold text-slate-800">
                🕐 Available Slots
              </Text>
            </View>

            {/* Slot chips */}
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
                        ? "bg-slate-800 border-yellow-400"
                        : "bg-white border-slate-200"
                    }`}
                    style={{
                      elevation: isSelected ? 5 : 2,
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: isSelected ? 3 : 1 },
                      shadowOpacity: isSelected ? 0.18 : 0.07,
                      shadowRadius: isSelected ? 5 : 3,
                    }}
                  >
                    <Text
                      className={`text-sm font-semibold ${
                        isSelected ? "text-yellow-400" : "text-slate-600"
                      }`}
                    >
                      {time}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Book button */}
            {selectedSlot && (
              <TouchableOpacity
                onPress={handleBook}
                activeOpacity={0.85}
                className="mt-6 bg-slate-800 rounded-2xl py-4 border-2 border-yellow-400
                  flex-row items-center justify-center gap-2"
                style={{
                  elevation: 7,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.22,
                  shadowRadius: 8,
                }}
              >
                <Ionicons name="calendar-outline" size={20} color="#ffd700" />
                <Text className="text-yellow-400 text-base font-bold">
                  Book at {selectedSlot}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        <View className="h-14" />
      </ScrollView>

      {/* ════════════════════════════════════════════════════════════════
          SUCCESS TOAST
      ════════════════════════════════════════════════════════════════ */}
      {showSuccess && (
        <View
          className="absolute bottom-10 left-4 right-4 bg-green-600 py-3.5 px-5
            rounded-2xl flex-row items-center gap-3 z-50"
          style={{
            elevation: 10,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.25,
            shadowRadius: 8,
          }}
        >
          <Ionicons name="checkmark-circle" size={22} color="#fff" />
          <Text className="text-white font-semibold text-sm flex-1">
            Booking confirmed for {selectedSlot}!
          </Text>
        </View>
      )}
    </>
  );
}