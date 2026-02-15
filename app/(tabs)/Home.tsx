import React from "react";
import {
  Text,
  View,
  StatusBar as RNStatusBar,
  FlatList,
  TouchableOpacity,
  Image,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ImageBackground } from "expo-image";
import { BlurView } from "expo-blur";
import { restaurants } from "../../store/resturants";

const background = require("../../assets/images/background.png");

export default function Home() {
  const renderItems = ({ item }: any) => (
  <TouchableOpacity className="w-45 mr-4 bg-white rounded-2xl shadow-lg overflow-hidden">
    
    <Image
      source={{ uri: item.image }}
      resizeMode="cover"
      className="h-28 w-full"
    />

    <View className="p-3">
      <Text
        numberOfLines={1}
        className="text-sm font-bold text-gray-800"
      >
        {item.name}
      </Text>

      <Text
        numberOfLines={1}
        className="text-xs text-slate-800 mt-1"
      >
        {item.address}
      </Text>
      <Text
        numberOfLines={1}
        className="text-xs text-gray-500 mt-1"
      >
        Opening : <Text className="text-black font-medium">{item.opening}</Text> - Closing :<Text className="text-black font-medium">{item.closing}</Text>
      </Text>
    </View>
  </TouchableOpacity>
);

  return (
    <SafeAreaView className="flex-1 bg-[#d1bea7]">
      <RNStatusBar backgroundColor="#1e293b" barStyle="light-content" />

      {/* Header (Fixed) */}
      <View className="items-center pt-2">
        <View className="bg-slate-800 border-t-amber-500 border-b-amber-500 border w-11/12 rounded-2xl shadow-xl p-6 items-center justify-center flex-row gap-3">
          <Text className="text-white text-lg font-medium">Welcome To</Text>

          <Text className="text-[#ffd700] text-2xl font-bold">Dine Time 🍽</Text>

          
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
        <FlatList
          data={restaurants}
          renderItem={renderItems}
          keyExtractor={(item, index) => index.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 5 }}
        />
       
      </ScrollView>
    </SafeAreaView>
  );
}
