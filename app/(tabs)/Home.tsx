import { BlurView } from "expo-blur";
import { ImageBackground } from "expo-image";
import React, { useEffect, useState } from "react";
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
// import { restaurants } from "../../store/resturants";
import { db } from "@/config/firebaseconfig";
import { useRouter } from "expo-router";
import { collection, getDocs, query } from "firebase/firestore";
import { discounts } from "../../store/resturants";
const background = require("../../assets/images/background.png");
export default function Home() {
  const router = useRouter();
  const [restaurants, setRestaurants] = useState<
    Array<{ id: string;[key: string]: any }>
  >([]);
  const [loading, setLoading] = useState(false);
  const renderItems = ({ item }: any) => (
    <TouchableOpacity
      onPress={() => router.push(`/restaurant/${item.id}` as any)}
      className="w-45 mr-4  bg-white rounded-2xl shadow-lg overflow-hidden"
    >
      <Image
        source={{ uri: item.image }}
        resizeMode="cover"
        className="h-28 w-full"
      />
      <View className="p-3">
        <Text numberOfLines={1} className="text-sm font-bold text-gray-800">
          {item.name}
        </Text>
        <Text numberOfLines={1} className="text-xs text-gray-500 mt-1">
          {item.address}
        </Text>
      </View>
    </TouchableOpacity>
  );
  const getrestaurants = async () => {
    try {
      setLoading(true);

      const q = query(collection(db, "restaurants"));
      const res = await getDocs(q);

      const data = res.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setRestaurants(data);
    } catch (error) {
      console.log("Error fetching restaurants:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getrestaurants();
  }, []);
  const renderdiscount = ({ item }: any) => (
    <TouchableOpacity className="w-45 mr-4  bg-white rounded-2xl shadow-lg overflow-hidden">
      <Image
        source={{ uri: item.image }}
        resizeMode="cover"
        className="h-28 w-full"
      />

      <View className="p-3">
        <Text numberOfLines={1} className="text-sm font-bold text-gray-800">
          {item.name}
        </Text>

        <Text numberOfLines={1} className="text-xs text-slate-800 mt-1">
          {item.address}
        </Text>
        <Text numberOfLines={1} className="text-xs text-gray-500 mt-1">
          Opening :{" "}
          <Text className="text-black font-medium">{item.opening}</Text> -
          Closing :
          <Text className="text-black font-medium">{item.closing}</Text>
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView
      className="flex-1 bg-[#d1bea7]"
      style={[Platform.OS == "ios" && { paddingBottom: 20 }]}
    >
      <RNStatusBar backgroundColor="#1e293b" barStyle="light-content" />

      {/* Header (Fixed) */}
      <View className="items-center pt-2">
        <View className="bg-slate-800 border-t-amber-500 border-b-amber-500 border w-11/12 rounded-2xl shadow-xl p-6 items-center justify-center flex-row gap-3">
          <Text className="text-white text-lg font-medium">Welcome To</Text>

          <Text className="text-[#ffd700] text-2xl font-bold">
            Dine Time 🍽
          </Text>
        </View>
      </View>

      {/* Content Scroll */}
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
            <Text
              style={{
                color: "white",
                fontWeight: "bold",
                fontSize: 28,
                textAlign: "center",
              }}
            >
              Celebrate Every Bite..
            </Text>
            <Text
              style={{
                color: "#e5e7eb",
                marginTop: 8,
                textAlign: "center",
              }}
            >
              Discover amazing places around you
            </Text>
          </BlurView>
        </ImageBackground>

        {/* Section Title */}
        <Text className="text-xl font-bold px-4 mb-3 ">
          Popular Restaurants 🍴
        </Text>

        {/* Horizontal Restaurant List */}
        <View style={{ height: 150, justifyContent: "center" }}>
          {loading ? (
            <ActivityIndicator size="large" color="orange" />
          ) : restaurants.length === 0 ? (
            <Text className="text-center text-gray-600">
              No restaurants found
            </Text>
          ) : (
            <FlatList
              data={restaurants}
              renderItem={renderItems}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 5 }}
            />
          )}
        </View>
        <Text className="text-xl font-bold px-4 mb-3 mt-4 ">Hot Deals 🔥</Text>

        {/* Horizontal Restaurant List */}
        <FlatList
          data={discounts}
          renderItem={renderdiscount}
          keyExtractor={(item, index) => index.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 5 }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
