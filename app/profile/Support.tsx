import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    Linking,
    ScrollView,
    StatusBar,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type FAQItem = {
    question: string;
    answer: string;
};

const faqData: FAQItem[] = [
    {
        question: "How do I make a restaurant booking?",
        answer:
            "Browse restaurants from the Home page, select your preferred restaurant, choose a date, time slot, and number of guests, then confirm your booking. You'll receive a confirmation once it's submitted.",
    },
    {
        question: "Can I cancel or modify my booking?",
        answer:
            "Currently, you can view your bookings in the History tab. To cancel or modify a booking, please contact the restaurant directly or reach out to our support team via email or phone.",
    },
    {
        question: "How does guest booking work?",
        answer:
            "Guest users can make bookings by providing their name and mobile number. An OTP will be sent to verify your phone number. Once verified, your booking is confirmed. Verification is cached for 24 hours.",
    },
    {
        question: "Is my personal data secure?",
        answer:
            "Yes, we use Firebase Authentication and Firestore with security rules to protect your data. Your password is never stored in plain text, and all communication is encrypted.",
    },
    {
        question: "How do I create an account?",
        answer:
            "Go to the Profile tab and tap 'Create Account'. You'll need to provide your email, a password, and a username. After signing up, you'll have access to all features including booking history.",
    },
];

export default function SupportScreen() {
    const router = useRouter();
    const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

    const toggleFAQ = (index: number) => {
        setExpandedIndex(expandedIndex === index ? null : index);
    };

    return (
        <SafeAreaView className="flex-1 bg-[#d1bea7]">
            <StatusBar backgroundColor="#1e293b" barStyle="light-content" />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 40 }}
            >
                {/* ── Header Banner ───────────────────────────────── */}
                <View className="bg-slate-800 pt-4 pb-10 px-6 rounded-b-[32px]">
                    <View className="flex-row items-center">
                        <TouchableOpacity
                            onPress={() => router.back()}
                            className="w-10 h-10 rounded-full bg-white/10 items-center justify-center"
                        >
                            <Ionicons name="arrow-back" size={22} color="#fff" />
                        </TouchableOpacity>
                        <Text className="text-white text-xl font-bold flex-1 text-center mr-10">
                            Help & Support
                        </Text>
                    </View>
                </View>

                {/* ── Contact Card ─────────────────────────────────── */}
                <View className="px-5 mt-6">
                    <View
                        className="bg-white rounded-3xl px-6 py-6"
                        style={{
                            elevation: 6,
                            shadowColor: "#000",
                            shadowOffset: { width: 0, height: 3 },
                            shadowOpacity: 0.1,
                            shadowRadius: 10,
                        }}
                    >
                        <Text className="text-slate-800 text-base font-bold mb-1">
                            Contact Us
                        </Text>
                        <Text className="text-slate-400 text-xs mb-5">
                            We're here to help. Reach out anytime!
                        </Text>

                        {/* Email */}
                        <TouchableOpacity
                            className="flex-row items-center bg-blue-50 rounded-2xl px-4 py-3.5 mb-3"
                            activeOpacity={0.7}
                            onPress={() =>
                                Linking.openURL("mailto:support@dinetime.app")
                            }
                        >
                            <View className="w-10 h-10 rounded-xl bg-blue-100 items-center justify-center mr-3">
                                <Ionicons name="mail" size={20} color="#3b82f6" />
                            </View>
                            <View className="flex-1">
                                <Text className="text-slate-800 text-sm font-semibold">
                                    Email Support
                                </Text>
                                <Text className="text-blue-500 text-xs mt-0.5">
                                    support@dinetime.app
                                </Text>
                            </View>
                            <Ionicons name="open-outline" size={16} color="#94a3b8" />
                        </TouchableOpacity>

                        {/* Phone */}
                        <TouchableOpacity
                            className="flex-row items-center bg-green-50 rounded-2xl px-4 py-3.5"
                            activeOpacity={0.7}
                            onPress={() => Linking.openURL("tel:+911234567890")}
                        >
                            <View className="w-10 h-10 rounded-xl bg-green-100 items-center justify-center mr-3">
                                <Ionicons name="call" size={20} color="#10b981" />
                            </View>
                            <View className="flex-1">
                                <Text className="text-slate-800 text-sm font-semibold">
                                    Call Us
                                </Text>
                                <Text className="text-green-600 text-xs mt-0.5">
                                    +91 123 456 7890
                                </Text>
                            </View>
                            <Ionicons name="open-outline" size={16} color="#94a3b8" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* ── FAQ Section ──────────────────────────────────── */}
                <View className="px-5 mt-6">
                    <Text className="text-slate-700 font-semibold text-base mb-3 ml-1">
                        Frequently Asked Questions
                    </Text>

                    <View
                        className="bg-white rounded-3xl overflow-hidden"
                        style={{
                            elevation: 6,
                            shadowColor: "#000",
                            shadowOffset: { width: 0, height: 3 },
                            shadowOpacity: 0.1,
                            shadowRadius: 10,
                        }}
                    >
                        {faqData.map((faq, index) => (
                            <View key={index}>
                                {index > 0 && <View className="h-px bg-slate-100 mx-5" />}

                                <TouchableOpacity
                                    activeOpacity={0.7}
                                    onPress={() => toggleFAQ(index)}
                                    className="px-5 py-4"
                                >
                                    <View className="flex-row items-center">
                                        <View
                                            className="w-8 h-8 rounded-xl items-center justify-center mr-3"
                                            style={{ backgroundColor: "#f59e0b15" }}
                                        >
                                            <Text className="text-amber-500 font-bold text-sm">
                                                Q{index + 1}
                                            </Text>
                                        </View>
                                        <Text className="text-slate-800 text-sm font-semibold flex-1 mr-2">
                                            {faq.question}
                                        </Text>
                                        <Ionicons
                                            name={
                                                expandedIndex === index
                                                    ? "chevron-up"
                                                    : "chevron-down"
                                            }
                                            size={18}
                                            color="#94a3b8"
                                        />
                                    </View>

                                    {expandedIndex === index && (
                                        <View className="mt-3 ml-11 mr-2 bg-slate-50 rounded-xl px-4 py-3">
                                            <Text className="text-slate-600 text-xs leading-5">
                                                {faq.answer}
                                            </Text>
                                        </View>
                                    )}
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>
                </View>

                {/* ── App Version ──────────────────────────────────── */}
                <View className="items-center mt-8">
  <Text className="text-slate-500 text-xs mb-3">
    Dine Time v1.5.0
  </Text>

  <Text className="text-slate-600 text-xs">
    Made with ❤️ BY Team Dine Time
  </Text>
</View>
            </ScrollView>
        </SafeAreaView>
    );
}
