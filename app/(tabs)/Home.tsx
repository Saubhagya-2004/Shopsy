import { BlurView } from "expo-blur";
import { ImageBackground } from "expo-image";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Platform,
  StatusBar as RNStatusBar,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { db } from "@/config/firebaseconfig";
import { useRouter } from "expo-router";
import { collection, getDocs, query } from "firebase/firestore";
import { discounts } from "../../store/resturants";

const background = require("../../assets/images/background.png");
const CARD_WIDTH = 176 + 16; // w-44 (176px) + mr-4 (16px)

// ─── Types ────────────────────────────────────────────────────────────────────
type Restaurant = { id: string; [key: string]: any };

// ─── Arrow Button ─────────────────────────────────────────────────────────────
const ArrowButton = ({
  direction,
  onPress,
  disabled,
}: {
  direction: "left" | "right";
  onPress: () => void;
  disabled: boolean;
}) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={disabled}
    activeOpacity={0.7}
    className={`w-12 h-12 rounded-full items-center justify-center border-2 ${
      disabled
        ? "bg-stone-300/50 border-stone-300"
        : "bg-slate-800 border-amber-400"
    }`}
    style={{
      elevation: disabled ? 0 : 4,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: disabled ? 0 : 0.2,
      shadowRadius: 3,
    }}
  >
    <Text
      className={`text-xl font-bold leading-none ${
        disabled ? "text-stone-400" : "text-amber-400"
      }`}
      style={{ marginTop: -1 }}
    >
      {direction === "left" ? "‹" : "›"}
    </Text>
  </TouchableOpacity>
);

// ─── Section Header ───────────────────────────────────────────────────────────
const SectionHeader = ({
  title,
  onLeft,
  onRight,
  canLeft,
  canRight,
}: {
  title: string;
  onLeft: () => void;
  onRight: () => void;
  canLeft: boolean;
  canRight: boolean;
}) => (
  <View className="flex-row items-center justify-between px-4 mt-5 mb-3">
    <Text className="text-xl font-bold text-slate-800 flex-1">{title}</Text>
    <View className="flex-row gap-2 ">
      <ArrowButton direction="left" onPress={onLeft} disabled={!canLeft} />
      <ArrowButton direction="right" onPress={onRight} disabled={!canRight} />
    </View>
  </View>
);

// ─── Home Screen ──────────────────────────────────────────────────────────────
export default function Home() {
  const router = useRouter();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(false);
  const restaurantRef = useRef<FlatList<Restaurant>>(null);
  const discountRef = useRef<FlatList<any>>(null);
  const [restIndex, setRestIndex] = useState(0);
  const [discIndex, setDiscIndex] = useState(0);

  // ── Scroll helper ─────────────────────────────────────────────────────────
  const scrollList = (
    ref: React.RefObject<FlatList<any> | null>,
    currentIndex: number,
    setIndex: (n: number) => void,
    dataLength: number,
    direction: "left" | "right"
  ) => {
    if (dataLength === 0) return;
    const next =
      direction === "right"
        ? Math.min(currentIndex + 1, dataLength - 1)
        : Math.max(currentIndex - 1, 0);
    ref.current?.scrollToIndex({ index: next, animated: true, viewPosition: 0 });
    setIndex(next);
  };

  // ── Fetch restaurants ─────────────────────────────────────────────────────
  const getRestaurants = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, "restaurants"));
      const res = await getDocs(q);
      setRestaurants(res.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.log("Error fetching restaurants:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getRestaurants();
  }, []);

  // ── Restaurant Card ───────────────────────────────────────────────────────
  const renderRestaurant = ({ item }: { item: Restaurant }) => (
    <TouchableOpacity
      onPress={() => router.push(`/restaurant/${item.id}` as any)}
      activeOpacity={0.85}
      className="w-44 mr-4 bg-white rounded-2xl overflow-hidden"
      style={{
        elevation: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.12,
        shadowRadius: 6,
      }}
    >
      <Image
        source={{ uri: item.image }}
        resizeMode="cover"
        className="h-28 w-full"
      />
      <View className="p-3">
        <Text numberOfLines={1} className="text-sm font-bold text-slate-800">
          {item.name}
        </Text>
        <Text numberOfLines={1} className="text-xs text-slate-400 mt-1">
          {item.address}
        </Text>
      </View>
    </TouchableOpacity>
  );

  // ── Discount Card ─────────────────────────────────────────────────────────
  const renderDiscount = ({ item }: { item: any }) => (
    <TouchableOpacity
      activeOpacity={0.85}
      className="w-44 mr-4 bg-white rounded-2xl overflow-hidden"
      style={{
        elevation: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.12,
        shadowRadius: 6,
      }}
    >
      {/* Image + HOT badge */}
      <View className="relative">
        <Image
          source={{ uri: item.image }}
          resizeMode="cover"
          className="h-28 w-full"
        />
        <View className="absolute top-2 right-2 bg-red-500 rounded-lg px-2 py-0.5">
          <Text className="text-white text-xs font-bold">HOT 🔥</Text>
        </View>
      </View>

      <View className="p-3">
        <Text numberOfLines={1} className="text-sm font-bold text-slate-800">
          {item.name}
        </Text>
        <Text numberOfLines={1} className="text-xs text-slate-500 mt-1">
          {item.address}
        </Text>
        <Text numberOfLines={1} className="text-xs text-slate-400 mt-1">
          🕐{" "}
          <Text className="text-slate-700 font-semibold">{item.opening}</Text>
          {" – "}
          <Text className="text-slate-700 font-semibold">{item.closing}</Text>
        </Text>
      </View>
    </TouchableOpacity>
  );

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView
      className="flex-1 bg-[#d1bea7]"
      style={[Platform.OS === "ios" && { paddingBottom: 20 }]}
    >
      <RNStatusBar backgroundColor="#1e293b" barStyle="light-content" />

      {/* Header */}
      <View className="items-center pt-2">
        <View className="bg-slate-800 border border-amber-500 w-11/12 rounded-2xl shadow-xl p-6 items-center justify-center flex-row gap-3">
          <Text className="text-white text-lg font-medium">Welcome To</Text>
          <Text className="text-[#ffd700] text-2xl font-bold">
            Dine Time 🍽
          </Text>
        </View>
      </View>

      {/* Scrollable Content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Banner */}
        <ImageBackground
          source={background}
          contentFit="cover"
          style={{
            height: 200,
            width: "100%",
            marginVertical: 2,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <BlurView
            intensity={70}
            tint="dark"
            style={{
              flex: 1,
              width: "100%",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text className="text-white font-bold text-3xl text-center">
              Celebrate Every Bite..
            </Text>
            <Text className="text-gray-200 mt-2 text-center">
              Discover amazing places around you
            </Text>
          </BlurView>
        </ImageBackground>

        {/* ── Popular Restaurants ── */}
        <SectionHeader
          title="Popular Restaurants 🍴"
          onLeft={() =>
            scrollList(restaurantRef, restIndex, setRestIndex, restaurants.length, "left")
          }
          onRight={() =>
            scrollList(restaurantRef, restIndex, setRestIndex, restaurants.length, "right")
          }
          canLeft={restIndex > 0}
          canRight={restIndex < restaurants.length - 1}
        />

        <View style={{ height: 170, justifyContent: "center" }}>
          {loading ? (
            <ActivityIndicator size="large" color="orange" />
          ) : restaurants.length === 0 ? (
            <Text className="text-center text-gray-600">
              No restaurants found
            </Text>
          ) : (
            <FlatList
              ref={restaurantRef}
              data={restaurants}
              renderItem={renderRestaurant}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16 }}
              onScrollToIndexFailed={() => {}}
              onMomentumScrollEnd={(e) => {
                const index = Math.round(
                  e.nativeEvent.contentOffset.x / CARD_WIDTH
                );
                setRestIndex(index);
              }}
            />
          )}
        </View>

        {/* ── Hot Deals ── */}
        <SectionHeader
          title="Hot Deals 🔥"
          onLeft={() =>
            scrollList(discountRef, discIndex, setDiscIndex, discounts.length, "left")
          }
          onRight={() =>
            scrollList(discountRef, discIndex, setDiscIndex, discounts.length, "right")
          }
          canLeft={discIndex > 0}
          canRight={discIndex < discounts.length - 1}
        />

        <FlatList
          ref={discountRef}
          data={discounts}
          renderItem={renderDiscount}
          keyExtractor={(_, index) => index.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16 }}
          onScrollToIndexFailed={() => {}}
          onMomentumScrollEnd={(e) => {
            const index = Math.round(
              e.nativeEvent.contentOffset.x / CARD_WIDTH
            );
            setDiscIndex(index);
          }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}