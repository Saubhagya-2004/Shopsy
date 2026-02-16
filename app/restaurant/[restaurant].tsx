import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/config/firebaseconfig";
import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native";

export default function RestaurantDetail() {
  const { restaurant } = useLocalSearchParams();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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

    if (restaurant) {
      fetchRestaurant();
    }
  }, [restaurant]);

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
        <Text className="text-lg text-gray-700">Restaurant not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#d1bea7]">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Back Button */}
        <TouchableOpacity
          onPress={() => router.back()}
          className="absolute top-4 left-4 z-10 bg-white/80 rounded-full p-2"
        >
          <Ionicons name="arrow-back" size={24} color="#1e293b" />
        </TouchableOpacity>

        {/* Restaurant Image */}
        {data.image && (
          <Image
            source={{ uri: data.image }}
            className="w-full h-64"
            resizeMode="cover"
          />
        )}

        {/* Restaurant Info */}
        <View className="p-5">
          <Text className="text-2xl font-bold text-slate-800">
            {data.name}
          </Text>

          <View className="flex-row items-center mt-2">
            <Ionicons name="location-outline" size={18} color="#64748b" />
            <Text className="text-sm text-gray-600 ml-1">{data.address}</Text>
          </View>

          {(data.opening || data.closing) && (
            <View className="flex-row items-center mt-2">
              <Ionicons name="time-outline" size={18} color="#64748b" />
              <Text className="text-sm text-gray-600 ml-1">
                {data.opening} - {data.closing}
              </Text>
            </View>
          )}

          {/* ID Badge */}
          <View className="mt-4 bg-slate-800 rounded-xl p-3">
            <Text className="text-amber-400 text-xs font-medium">
              Restaurant ID
            </Text>
            {/* <Text className="text-white text-sm mt-1">{data.id}</Text> */}
          </View>

          {/* Description */}
          {data.seats && (
            <View className="mt-4">
              <Text className="text-lg font-bold text-slate-800">Seats</Text>
              <Text className="text-sm text-gray-600 mt-1 leading-5">
                {data.seats}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
