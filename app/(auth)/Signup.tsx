import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Formik } from "formik";

const btnimg = require("./../../assets/images/buttom.png");
const logo = require("./../../assets/images/dine-time.png");

export default function Signup() {
  const router = useRouter();
const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const handleSubmitForm = () => {
    router.push("/Home");
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
              <Text className="text-base text-stone-500 mt-3 text-center px-4">
                Create your account and explore amazing dining experiences.
              </Text>
            </View>

            {/* Form Section */}
            <View className="w-5/6 self-center">
              <Formik
                initialValues={{ email: "", password: "", userName: "" }}
                onSubmit={handleSubmitForm}
              >
                {({
                  values,
                  handleBlur,
                  handleChange,
                  handleSubmit,
                }) => (
                  <View className="w-full gap-1">

                    {/* Email */}
                    <Text className="font-medium text-orange-500 mt-2 mb-1">Email</Text>
                    <TextInput
                      className={`border border-slate-800 rounded-3xl px-4 py-3 hover:ring-2 ${ focusedInput === "email"
      ? "border-orange-400 border-2"
      : "border-slate-800"}`}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      onChangeText={handleChange("email")}
                      onBlur={handleBlur("email")}
                      onFocus={()=>setFocusedInput('email')}
                      value={values.email}
                    />

                    {/* Password */}
                    <Text className="font-medium text-orange-500 mt-2 mb-1">Password</Text>
                    <TextInput
                      className={`border border-slate-800 rounded-3xl px-4 py-3 hover:ring-2 ${ focusedInput === "password"
      ? "border-orange-400 border"
      : "border-slate-800"}`}
                      secureTextEntry={true}
                      autoCapitalize="none"
                      autoCorrect={false}
                      textContentType="password"
                      onChangeText={handleChange("password")}
                      onFocus={()=>setFocusedInput('password')}
                      onBlur={handleBlur("password")}
                      value={values.password}
                    />

                    {/* Button */}
                    <TouchableOpacity
                      className="bg-green-600 py-4 rounded-2xl shadow-lg shadow-green-600/30"
                      onPress={()=>handleSubmit()}
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
            <View className="items-center mb-6 mt-8">
              <Image
                source={btnimg}
                style={{ width: "80%", height: 100, opacity: 0.6 }}
                resizeMode="contain"
              />
            </View>

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
              <View className="flex-row justify-center items-center mt-4 pb-2">
                <Text className="text-stone-500 text-base">
                  Already have an account?{" "}
                </Text>
                <TouchableOpacity onPress={() => router.push("/")}>
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
