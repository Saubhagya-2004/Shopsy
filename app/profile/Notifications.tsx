import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ScrollView,
    StatusBar,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type NotificationPrefs = {
    bookingConfirmations: boolean;
    offersDeals: boolean;
    reminders: boolean;
    appUpdates: boolean;
};

const STORAGE_KEY = "notificationPrefs";

const defaultPrefs: NotificationPrefs = {
    bookingConfirmations: true,
    offersDeals: true,
    reminders: true,
    appUpdates: false,
};

export default function NotificationsScreen() {
    const router = useRouter();
    const [prefs, setPrefs] = useState<NotificationPrefs>(defaultPrefs);

    useEffect(() => {
        const load = async () => {
            try {
                const stored = await AsyncStorage.getItem(STORAGE_KEY);
                if (stored) setPrefs(JSON.parse(stored));
            } catch (e) {
                console.error("Error loading notification prefs:", e);
            }
        };
        load();
    }, []);

    const toggle = async (key: keyof NotificationPrefs) => {
        const updated = { ...prefs, [key]: !prefs[key] };
        setPrefs(updated);
        try {
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        } catch (e) {
            console.error("Error saving notification prefs:", e);
        }
    };

    const notificationItems: {
        key: keyof NotificationPrefs;
        icon: string;
        label: string;
        description: string;
        color: string;
    }[] = [
            {
                key: "bookingConfirmations",
                icon: "checkmark-circle",
                label: "Booking Confirmations",
                description: "Get notified when your booking is confirmed",
                color: "#3b82f6",
            },
            {
                key: "offersDeals",
                icon: "pricetag",
                label: "Offers & Deals",
                description: "Receive exclusive offers and discounts",
                color: "#f59e0b",
            },
            {
                key: "reminders",
                icon: "alarm",
                label: "Booking Reminders",
                description: "Reminders before your upcoming reservations",
                color: "#8b5cf6",
            },
            {
                key: "appUpdates",
                icon: "refresh-circle",
                label: "App Updates",
                description: "Stay informed about new features and updates",
                color: "#10b981",
            },
        ];

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
                            Notifications
                        </Text>
                    </View>
                </View>

                {/* ── Description ──────────────────────────────────── */}
                <View className="px-5 mt-6 mb-2">
                    <Text className="text-slate-700 text-sm leading-5">
                        Manage your notification preferences. Toggle the categories below to
                        control what notifications you receive.
                    </Text>
                </View>

                {/* ── Notification Toggles ──────────────────────────── */}
                <View className="px-5 mt-4">
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
                        {notificationItems.map((item, index) => (
                            <View key={item.key}>
                                {index > 0 && <View className="h-px bg-slate-100 mx-5" />}
                                <View className="px-5 py-4 flex-row items-center">
                                    {/* Icon */}
                                    <View
                                        className="w-11 h-11 rounded-2xl items-center justify-center mr-4"
                                        style={{ backgroundColor: item.color + "15" }}
                                    >
                                        <Ionicons
                                            name={item.icon as any}
                                            size={22}
                                            color={item.color}
                                        />
                                    </View>

                                    {/* Text */}
                                    <View className="flex-1 mr-3">
                                        <Text className="text-slate-800 text-sm font-semibold">
                                            {item.label}
                                        </Text>
                                        <Text className="text-slate-400 text-xs mt-0.5 leading-4">
                                            {item.description}
                                        </Text>
                                    </View>

                                    {/* Switch */}
                                    <Switch
                                        value={prefs[item.key]}
                                        onValueChange={() => toggle(item.key)}
                                        trackColor={{ false: "#e2e8f0", true: item.color + "40" }}
                                        thumbColor={prefs[item.key] ? item.color : "#94a3b8"}
                                        ios_backgroundColor="#e2e8f0"
                                    />
                                </View>
                            </View>
                        ))}
                    </View>
                </View>

                {/* ── Info Note ─────────────────────────────────────── */}
                <View className="px-5 mt-6">
                    <View
                        className="bg-white/70 rounded-2xl px-5 py-4 flex-row items-start"
                        style={{ elevation: 2 }}
                    >
                        <Ionicons
                            name="information-circle-outline"
                            size={20}
                            color="#64748b"
                            style={{ marginTop: 1 }}
                        />
                        <Text className="text-slate-500 text-xs ml-3 flex-1 leading-4">
                            You can also manage notifications from your device settings.
                            Disabling notifications here will only affect in-app alerts.
                        </Text>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
