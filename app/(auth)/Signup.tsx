import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { createUserWithEmailAndPassword, getAuth } from "firebase/auth";
import { doc, getFirestore, setDoc } from "firebase/firestore";
import { Formik } from "formik";
import React, { useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import validationScema from "../utils/authSchema";
const btnimg = require("./../../assets/images/buttom.png");
const logo = require("./../../assets/images/dine-time.png");
export default function Signup() {
  const router = useRouter();
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const auth = getAuth();
  const db = getFirestore();
  const handleSubmitForm = async (values: any) => {
    try {
      const usercredential = await createUserWithEmailAndPassword(
        auth,
        values.email,
        values.password,
      );
      const user = usercredential.user;
      await setDoc(doc(db, "users", user.uid), {
        userName: values.userName,
        email: values.email,
        userId: user.uid,
        createdAt: Date.now(),
      });
      await AsyncStorage.setItem("userEmail", values.email);
      await AsyncStorage.setItem("userName", values.userName);
      router.push("/Home");
      console.log(user, AsyncStorage.getItem("userEmail"));
    } catch (error: any) {
      let message = "Something went wrong. Please try again.";

      if (error.code === "auth/email-already-in-use") {
        message = "This email is already registered. Try logging in instead.";
      } else if (error.code === "auth/invalid-email") {
        message = "Invalid email format.";
      } else if (error.code === "auth/weak-password") {
        message = "Password should be at least 6 characters.";
      }

      Alert.alert(
        "Signup Failed",
        message,
        [{ text: "OK", style: "default" }],
        { cancelable: true },
      );

      console.log("Signup Error:", error);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#f8f4f0]">
      <StatusBar backgroundColor="red" barStyle="dark-content" />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-1 px-6 pb-4">
            {/* Logo Section */}
            <View className="items-center mt-4 mb-6">
              <View className="bg-white/80 p-4 rounded-3xl shadow-sm">
                <Image
                  source={logo}
                  style={{ width: 200, height: 120 }}
                  resizeMode="contain"
                />
              </View>
            </View>

            {/* Title Section */}
            <View className="mb-8">
              <Text className="text-xl font-bold text-stone-800 text-center">
                Let's Get Started
              </Text>
              <Text className="text-base text-slate-500 mt-3 text-center px-4">
                Create your account and explore amazing dining experiences.
              </Text>
            </View>

            {/* Form Section */}
            <View className="w-5/6 self-center">
              <Formik
                initialValues={{ email: "", password: "", userName: "" }}
                onSubmit={handleSubmitForm}
                validationSchema={validationScema}
              >
                {({
                  values,
                  handleBlur,
                  handleChange,
                  handleSubmit,
                  touched,
                  errors,
                }) => (
                  <View className="w-full gap-1">
                    {/* Email */}
                    <Text className="font-medium text-orange-500 mt-2 mb-1">
                      Email
                    </Text>
                    <TextInput
                      className={`border border-slate-800 rounded-3xl px-4 py-3 hover:ring-2 ${focusedInput === "email"
                          ? "border-cyan-400 border"
                          : "border-slate-800"
                        }`}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      onChangeText={handleChange("email")}
                      onBlur={handleBlur("email")}
                      onFocus={() => setFocusedInput("email")}
                      value={values.email}
                    />
                    {touched.email && errors.email && (
                      <Text className="text-red-500 mb-2 text-xs">
                        {errors.email}
                      </Text>
                    )}
                    {/* Password */}
                    <Text className="font-medium text-orange-500 mt-2 mb-1">
                      Password
                    </Text>
                    <TextInput
                      className={`border border-slate-800 rounded-3xl px-4 py-3 hover:ring-2 ${focusedInput === "password"
                          ? "border-cyan-400 border"
                          : "border-slate-800"
                        }`}
                      secureTextEntry={true}
                      autoCapitalize="none"
                      autoCorrect={false}
                      textContentType="password"
                      onChangeText={handleChange("password")}
                      onFocus={() => setFocusedInput("password")}
                      onBlur={handleBlur("password")}
                      value={values.password}
                    />
                    {touched.password && errors.password && (
                      <Text className="text-red-500 mb-2 text-xs">
                        {errors.password}
                      </Text>
                    )}

                    <Text className="font-medium text-orange-500 mt-2 mb-1">
                      userName
                    </Text>
                    <TextInput
                      className={`border border-slate-800 rounded-3xl px-4 py-3 hover:ring-2 ${focusedInput === "userName"
                          ? "border-cyan-400 border"
                          : "border-slate-800"
                        }`}
                      underlineColorAndroid="transparent"
                      keyboardType="default"
                      autoCapitalize="none"
                      autoCorrect={false}
                      textContentType="username"
                      onChangeText={handleChange("userName")}
                      onFocus={() => setFocusedInput("userName")}
                      onBlur={handleBlur("userName")}
                      value={values.userName}
                    />
                    {touched.userName && errors.userName && (
                      <Text className="text-red-500 mb-2 text-xs">
                        {errors.userName}
                      </Text>
                    )}
                    {/* Button */}
                    <TouchableOpacity
                      className="bg-green-600 py-4 rounded-2xl shadow-lg shadow-green-600/30 mt-10"
                      onPress={() => handleSubmit()}
                      activeOpacity={0.9}
                    >
                      <Text className="text-white text-center text-lg font-bold tracking-wide">
                        Create Account
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </Formik>
            </View>

            {/* Bottom Image */}
            <View className="items-center mb-2 mt-8">
              <Image
                source={btnimg}
                style={{ width: "80%", height: 100, opacity: 0.6 }}
                resizeMode="contain"
              />
            </View>
            <Text className="text-center mb-4   text-slate-600 font-semibold">
              <View className="flex-1 w-24 h-[1px] bg-orange-500 " /> or {""}
              <View className="flex-1 w-24 h-[1px] bg-orange-500" />
            </Text>
            <TouchableOpacity
              className="py-2 mb-3 mt-1 border border-green-600 rounded-2xl"
              onPress={() => router.replace("/Home")}
              activeOpacity={0.8}
            >
              <Text className="text-green-600 text-center text-lg font-semibold">
                Continue as Guest
              </Text>
            </TouchableOpacity>

            {/* Terms */}
            <View className="flex-row flex-wrap justify-center mb-8 px-4">
              <Text className="text-stone-500 text-sm text-center">
                By signing up, you agree to our{" "}
              </Text>
              <TouchableOpacity>
                <Text className="text-green-600 text-sm font-semibold">
                  Terms of Service
                </Text>
              </TouchableOpacity>
              <Text className="text-stone-500 text-sm"> and </Text>
              <TouchableOpacity>
                <Text className="text-green-600 text-sm font-semibold">
                  Privacy Policy
                </Text>
              </TouchableOpacity>
            </View>

            {/* Sign In */}
            <View className="mt-auto">
              <View className="flex-row justify-center items-center mt-3 pb-2">
                <Text className="text-stone-500 text-base">
                  Already have an account?{" "}
                </Text>
                <TouchableOpacity onPress={() => router.push("/Signin")}>
                  <Text className="text-green-600 text-base font-bold">
                    Sign In
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
