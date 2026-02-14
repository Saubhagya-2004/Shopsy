import { useRouter } from "expo-router";
import React from "react";
import {
  Image,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Video, ResizeMode } from "expo-av";
import { SafeAreaView } from "react-native-safe-area-context";
const logo = require("../assets/images/dine-time.png");
const btnimg = require("../assets/images/buttom.png");
export default function index() {
  const router = useRouter();
  return (
    <SafeAreaView className="bg-[#e5d7c7]">
      <StatusBar backgroundColor="bg-[#e5d7c7]" barStyle={"light-content"} />
      <ScrollView contentContainerStyle={{ height: "100%" }}>
        <View className="m-2 flex justify-center items-center">
          <Image
            source={logo}
            className="rounded-2xl"
            style={{ width: " 100%", height: 200 }}
          />
        </View>
        <View className="w-3/4 self-center">
          <TouchableOpacity
            className="p-2 my-2 bg-green-600 rounded-xl"
            onPress={() => router.push("/")}
          >
            <Text className="text-xl text-center font-semibold text-white">
              Sign Up
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="p-2 my-2 bg-orange-200  border border-stone-800 rounded-xl"
            onPress={() => router.push("/Home")}
          >
            <Text className="text-xl text-center font-semibold text-stone-800">
              Guest User
            </Text>
          </TouchableOpacity>
        </View>
        <Text className="text-center  my-2 text-slate-600 font-semibold">
          <View className="flex-1 w-24 h-[1px] bg-orange-500 " /> or {""}
          <View className="flex-1 w-24 h-[1px] bg-orange-500" />
        </Text>
        <TouchableOpacity
          className="flex flex-row item-center justify-center "
          onPress={() => router.push("/")}
        >
          <Text className="text-slate-800 font-semibold">
            Already a User ?{" "}
          </Text>
          <Text className="text-orange-600 shadow-md font-medium underline">
            Sign in
          </Text>
        </TouchableOpacity>
        {/* Attractive Video Section */}
        <View className="w-full  mt-8 items-center">
          <View className="w-11/12 rounded-3xl overflow-hidden shadow-xl bg-black">
            <Video
              source={require("../assets/images/video.home.mp4")}
              style={{ width: "100%", height: 220 }}
              resizeMode={ResizeMode.COVER}
              shouldPlay
              isLooping
              isMuted
            />
          </View>
        </View>
        <View className="flex items-center justify-center ">
          <Image source={btnimg}  className="rounded-2xl"
            style={{ width: " 100%", height: 200 }} />
        </View>
        
      </ScrollView>
    </SafeAreaView>
  );
}
