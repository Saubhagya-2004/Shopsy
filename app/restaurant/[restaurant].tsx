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

export default function RestaurantDetail() {
  const { restaurant } = useLocalSearchParams();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeSlide, setActiveSlide] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const carouselRef = useRef<FlatList>(null);

  // ── Fetch restaurant from Firestore ──
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

  // ── Match by restaurant name to find index in local data ──
  const matchIndex = data
    ? (localRestaurants as any[]).findIndex(
      (r: any) => r.name === data.name
    )
    : -1;

  const images =
    matchIndex >= 0 && matchIndex < carouselImages.length
      ? (carouselImages[matchIndex] as any).images
      : [];

  const timeSlots =
    matchIndex >= 0 && matchIndex < slots.length
      ? (slots[matchIndex] as any).slot
      : [];

  // ── Auto-scroll carousel ──
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

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: any) => {
      if (viewableItems.length > 0) {
        setActiveSlide(viewableItems[0].index ?? 0);
      }
    },
    []
  );

  const viewabilityConfig = useRef({
    viewAreaCoveragePercentThreshold: 50,
  }).current;

  // ── Loading state ──
  if (loading) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: "#d1bea7",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" color="orange" />
      </SafeAreaView>
    );
  }

  // ── Not found state ──
  if (!data) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: "#d1bea7",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text style={{ fontSize: 16, color: "#374151" }}>
          Restaurant not found
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#d1bea7" }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* ── Back Button ── */}
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            position: "absolute",
            top: 16,
            left: 16,
            zIndex: 10,
            backgroundColor: "rgba(255,255,255,0.85)",
            borderRadius: 50,
            padding: 8,
            elevation: 5,
          }}
        >
          <Ionicons name="arrow-back" size={24} color="#1e293b" />
        </TouchableOpacity>

        {/* ── Image Carousel ── */}
        {images.length > 0 ? (
          <View>
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
                  style={{ width: SCREEN_WIDTH, height: 280 }}
                  resizeMode="cover"
                />
              )}
            />
            {/* Dot indicators */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                position: "absolute",
                bottom: 12,
                width: "100%",
              }}
            >
              {images.map((_: any, i: number) => (
                <View
                  key={i}
                  style={{
                    width: i === activeSlide ? 22 : 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor:
                      i === activeSlide ? "#ffd700" : "rgba(255,255,255,0.6)",
                    marginHorizontal: 3,
                  }}
                />
              ))}
            </View>
          </View>
        ) : data.image ? (
          <Image
            source={{ uri: data.image }}
            style={{ width: "100%", height: 280 }}
            resizeMode="cover"
          />
        ) : null}

        {/* ── Restaurant Info Card (overlapping) ── */}
        <View
          style={{
            backgroundColor: "#fff",
            marginHorizontal: 16,
            marginTop: -30,
            borderRadius: 20,
            padding: 20,
            elevation: 6,
          }}
        >
          <Text
            style={{ fontSize: 22, fontWeight: "bold", color: "#1e293b" }}
          >
            {data.name}
          </Text>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginTop: 8,
            }}
          >
            <Ionicons name="location-outline" size={18} color="#64748b" />
            <Text
              style={{
                fontSize: 13,
                color: "#64748b",
                marginLeft: 4,
                flex: 1,
              }}
            >
              {data.address}
            </Text>
          </View>

          {(data.opening || data.closing) && (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: 6,
              }}
            >
              <Ionicons name="time-outline" size={18} color="#64748b" />
              <Text
                style={{ fontSize: 13, color: "#64748b", marginLeft: 4 }}
              >
                {data.opening} – {data.closing}
              </Text>
            </View>
          )}

          {data.seats && (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: 6,
              }}
            >
              <Ionicons name="people-outline" size={18} color="#64748b" />
              <Text
                style={{ fontSize: 13, color: "#64748b", marginLeft: 4 }}
              >
                {data.seats} seats available
              </Text>
            </View>
          )}
        </View>

        {/* ── Available Time Slots ── */}
        {timeSlots.length > 0 && (
          <View style={{ marginTop: 20, paddingHorizontal: 16 }}>
            <Text
              style={{
                fontSize: 18,
                fontWeight: "bold",
                color: "#1e293b",
                marginBottom: 12,
              }}
            >
              🕐 Available Slots
            </Text>

            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                gap: 10,
              }}
            >
              {timeSlots.map((time: string, i: number) => {
                const isSelected = selectedSlot === time;
                return (
                  <TouchableOpacity
                    key={i}
                    onPress={() =>
                      setSelectedSlot(isSelected ? null : time)
                    }
                    style={{
                      backgroundColor: isSelected ? "#1e293b" : "#fff",
                      borderWidth: 1.5,
                      borderColor: isSelected ? "#ffd700" : "#d1d5db",
                      borderRadius: 12,
                      paddingVertical: 10,
                      paddingHorizontal: 18,
                      elevation: isSelected ? 4 : 2,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "600",
                        color: isSelected ? "#ffd700" : "#1e293b",
                      }}
                    >
                      {time}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {selectedSlot && (
              <TouchableOpacity
                style={{
                  backgroundColor: "#1e293b",
                  borderRadius: 14,
                  paddingVertical: 14,
                  marginTop: 20,
                  alignItems: "center",
                  borderWidth: 1.5,
                  borderColor: "#ffd700",
                  elevation: 5,
                }}
              >
                <Text
                  style={{
                    color: "#ffd700",
                    fontSize: 16,
                    fontWeight: "bold",
                  }}
                >
                  Book at {selectedSlot}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Bottom spacing */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}