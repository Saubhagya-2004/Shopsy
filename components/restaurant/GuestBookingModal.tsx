import { Ionicons } from "@expo/vector-icons";
import { Formik } from "formik";
import React, { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Animated,
    Dimensions,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import validationSchema from "../../app/utils/guestformSubmit";
import { isPhoneVerified, saveVerifiedPhone } from "../../app/utils/guestSession";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

type Props = {
    visible: boolean;
    onClose: () => void;
    onSubmit: (values: any) => void;
    selectedSlot: string | null;
    selectedDate: Date;
    guestCount: number;
    restaurantName?: string;
};

const GuestBookingModal = ({
    visible,
    onClose,
    onSubmit,
    selectedSlot,
    selectedDate,
    guestCount,
    restaurantName,
}: Props) => {
    const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

    // OTP state
    const [otpStep, setOtpStep] = useState<"details" | "otp">("details");
    const [otpCode, setOtpCode] = useState("");
    const [confirmResult, setConfirmResult] = useState<any>(null);
    const [otpLoading, setOtpLoading] = useState(false);
    const [verifyLoading, setVerifyLoading] = useState(false);
    const [resendTimer, setResendTimer] = useState(0);
    const [pendingValues, setPendingValues] = useState<any>(null);
    const timerRef = useRef<any>(null);

    useEffect(() => {
        if (visible) {
            Animated.spring(slideAnim, {
                toValue: 0,
                useNativeDriver: true,
                damping: 20,
                stiffness: 200,
            }).start();
        } else {
            Animated.timing(slideAnim, {
                toValue: SCREEN_HEIGHT,
                duration: 250,
                useNativeDriver: true,
            }).start();
        }
    }, [visible]);

    // Reset state when modal closes
    useEffect(() => {
        if (!visible) {
            setOtpStep("details");
            setOtpCode("");
            setConfirmResult(null);
            setOtpLoading(false);
            setVerifyLoading(false);
            setPendingValues(null);
            if (timerRef.current) clearInterval(timerRef.current);
            setResendTimer(0);
        }
    }, [visible]);

    // Countdown timer for OTP resend
    useEffect(() => {
        if (resendTimer > 0) {
            timerRef.current = setInterval(() => {
                setResendTimer((prev) => {
                    if (prev <= 1) {
                        clearInterval(timerRef.current);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(timerRef.current);
        }
    }, [resendTimer]);

    const formatDate = (date: Date) =>
        date.toLocaleDateString("en-US", {
            weekday: "short",
            day: "numeric",
            month: "short",
        });

    const formatPhone = (phone: string) => {
        const cleaned = phone.replace(/\D/g, "");
        if (cleaned.startsWith("91") && cleaned.length > 10) return `+${cleaned}`;
        return `+91${cleaned}`;
    };

    // Generate a random 6-digit OTP
    const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

    // Step 1: Send OTP or skip if already verified
    const handleSendOTP = async (values: any) => {
        const phone = formatPhone(values.mobileNumber);
        setPendingValues(values);

        // Check if phone was already verified within 24hr window
        const verified = await isPhoneVerified(phone);
        if (verified) {
            onSubmit(values);
            return;
        }

        setOtpLoading(true);
        try {
            const otp = generateOTP();
            setConfirmResult(otp);
            setOtpStep("otp");
            setResendTimer(60);
            // Show OTP in alert for development — replace with real SMS service in production
            Alert.alert("OTP Sent", `Your verification code is: ${otp}\n\nSent to ${phone}`);
        } catch (error: any) {
            console.log("OTP Send Error:", error);
            Alert.alert("OTP Error", "Failed to send OTP. Please try again.");
        } finally {
            setOtpLoading(false);
        }
    };

    // Step 2: Verify OTP code
    const handleVerifyOTP = async () => {
        if (!confirmResult || otpCode.length !== 6) {
            Alert.alert("Invalid OTP", "Please enter the 6-digit code.");
            return;
        }
        setVerifyLoading(true);
        try {
            if (otpCode === confirmResult) {
                const phone = formatPhone(pendingValues.mobileNumber);
                await saveVerifiedPhone(phone);
                onSubmit(pendingValues);
            } else {
                Alert.alert("Verification Failed", "Invalid OTP. Please try again.");
            }
        } catch (error: any) {
            console.log("OTP Verify Error:", error);
            Alert.alert("Verification Failed", "Something went wrong. Please try again.");
        } finally {
            setVerifyLoading(false);
        }
    };

    const handleResendOTP = async () => {
        if (resendTimer > 0 || !pendingValues) return;
        await handleSendOTP(pendingValues);
    };

    return (
        <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
            <TouchableOpacity
                activeOpacity={1}
                onPress={onClose}
                className="flex-1 bg-black/70 justify-end"
            >
                <TouchableOpacity activeOpacity={1}>
                    <Animated.View
                        style={{ transform: [{ translateY: slideAnim }] }}
                        className="bg-slate-950 rounded-t-3xl border-t-2 border-l border-r border-orange-400 pb-10 overflow-hidden"
                    >
                        {/* Orange accent bar */}
                        <View className="h-0.5 bg-orange-400" />

                        {/* Header */}
                        <View className="px-6 pt-5 pb-4 flex-row items-center justify-between border-b border-orange-400/15">
                            <View>
                                <Text className="text-orange-400 text-xs font-bold tracking-widest uppercase">
                                    {otpStep === "details" ? "Guest Checkout" : "Verify Phone"}
                                </Text>
                                <Text className="text-slate-50 text-xl font-extrabold mt-0.5">
                                    {otpStep === "details" ? "Complete Booking" : "Enter OTP"}
                                </Text>
                            </View>
                            <TouchableOpacity
                                onPress={onClose}
                                className="w-9 h-9 rounded-full bg-orange-400/10 border border-orange-400/30 items-center justify-center"
                            >
                                <Ionicons name="close" size={18} color="#fb923c" />
                            </TouchableOpacity>
                        </View>

                        {/* Reservation Summary Card */}
                        <View className="mx-6 mt-4 bg-orange-400/5 rounded-2xl border border-orange-400/20 p-4">
                            <Text className="text-orange-400 text-xs font-bold tracking-widest uppercase mb-3">
                                Reservation Summary
                            </Text>
                            <View className="flex-row items-center justify-between mb-2">
                                <View className="flex-row items-center gap-2">
                                    <View className="w-6 h-6 rounded-md bg-orange-400/15 items-center justify-center">
                                        <Text className="text-xs">🍽️</Text>
                                    </View>
                                    <Text className="text-slate-400 text-sm">Restaurant</Text>
                                </View>
                                <Text className="text-slate-50 text-sm font-semibold" numberOfLines={1}>
                                    {restaurantName || "—"}
                                </Text>
                            </View>
                            <View className="flex-row items-center justify-between mb-2">
                                <View className="flex-row items-center gap-2">
                                    <View className="w-6 h-6 rounded-md bg-orange-400/15 items-center justify-center">
                                        <Text className="text-xs">📅</Text>
                                    </View>
                                    <Text className="text-slate-400 text-sm">Date</Text>
                                </View>
                                <Text className="text-slate-50 text-sm font-semibold">
                                    {formatDate(selectedDate)}
                                </Text>
                            </View>
                            <View className="flex-row items-center justify-between mb-2">
                                <View className="flex-row items-center gap-2">
                                    <View className="w-6 h-6 rounded-md bg-orange-400/15 items-center justify-center">
                                        <Text className="text-xs">🕐</Text>
                                    </View>
                                    <Text className="text-slate-400 text-sm">Time</Text>
                                </View>
                                <Text className="text-orange-400 text-sm font-bold">{selectedSlot}</Text>
                            </View>
                            <View className="h-px bg-orange-400/15 my-2" />
                            <View className="flex-row items-center justify-between">
                                <View className="flex-row items-center gap-2">
                                    <View className="w-6 h-6 rounded-md bg-orange-400/15 items-center justify-center">
                                        <Text className="text-xs">👥</Text>
                                    </View>
                                    <Text className="text-slate-400 text-sm">Guests</Text>
                                </View>
                                <Text className="text-slate-50 text-sm font-semibold">
                                    {guestCount} {guestCount === 1 ? "Guest" : "Guests"}
                                </Text>
                            </View>
                        </View>

                        {/* ── Step 1: Name + Phone + Send OTP ── */}
                        {otpStep === "details" && (
                            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
                                <Formik
                                    initialValues={{ fullName: "", mobileNumber: "" }}
                                    validationSchema={validationSchema}
                                    onSubmit={handleSendOTP}
                                >
                                    {({ values, handleBlur, handleChange, handleSubmit, touched, errors }) => (
                                        <View className="px-6 pt-5">
                                            <Text className="text-orange-400 text-xs font-bold tracking-widest uppercase mb-3">
                                                Your Details
                                            </Text>

                                            {/* Full Name */}
                                            <View className="mb-3">
                                                <Text className="text-slate-400 text-xs font-semibold mb-1.5 tracking-wide">
                                                    Full Name
                                                </Text>
                                                <View
                                                    className={`flex-row items-center bg-white/5 rounded-xl px-3.5 h-12 gap-2.5 border ${touched.fullName && errors.fullName
                                                            ? "border-red-500"
                                                            : "border-orange-400/25"
                                                        }`}
                                                >
                                                    <Ionicons name="person-outline" size={16} color="#64748b" />
                                                    <TextInput
                                                        value={values.fullName}
                                                        onChangeText={handleChange("fullName")}
                                                        onBlur={handleBlur("fullName")}
                                                        placeholder="John Doe"
                                                        placeholderTextColor="#475569"
                                                        className="flex-1 text-slate-50 text-sm"
                                                    />
                                                </View>
                                                {touched.fullName && errors.fullName && (
                                                    <Text className="text-red-500 text-xs mt-1 ml-1">{errors.fullName}</Text>
                                                )}
                                            </View>

                                            {/* Mobile Number */}
                                            <View className="mb-3">
                                                <Text className="text-slate-400 text-xs font-semibold mb-1.5 tracking-wide">
                                                    Mobile Number
                                                </Text>
                                                <View
                                                    className={`flex-row items-center bg-white/5 rounded-xl px-3.5 h-12 gap-2.5 border ${touched.mobileNumber && errors.mobileNumber
                                                            ? "border-red-500"
                                                            : "border-orange-400/25"
                                                        }`}
                                                >
                                                    <Ionicons name="call-outline" size={16} color="#64748b" />
                                                    <Text className="text-slate-400 text-sm font-medium">+91</Text>
                                                    <TextInput
                                                        value={values.mobileNumber}
                                                        onChangeText={handleChange("mobileNumber")}
                                                        onBlur={handleBlur("mobileNumber")}
                                                        placeholder="9876543210"
                                                        placeholderTextColor="#475569"
                                                        keyboardType="phone-pad"
                                                        maxLength={10}
                                                        className="flex-1 text-slate-50 text-sm"
                                                    />
                                                </View>
                                                {touched.mobileNumber && errors.mobileNumber && (
                                                    <Text className="text-red-500 text-xs mt-1 ml-1">{errors.mobileNumber}</Text>
                                                )}
                                            </View>

                                            {/* Send OTP Button */}
                                            <TouchableOpacity
                                                onPress={() => handleSubmit()}
                                                activeOpacity={0.85}
                                                disabled={otpLoading}
                                                className={`rounded-2xl h-14 flex-row items-center justify-center gap-2 ${otpLoading ? "bg-orange-400/50" : "bg-orange-400"
                                                    }`}
                                            >
                                                {otpLoading ? (
                                                    <ActivityIndicator color="#0f172a" />
                                                ) : (
                                                    <>
                                                        <Ionicons name="phone-portrait-outline" size={20} color="#0f172a" />
                                                        <Text className="text-slate-950 text-base font-extrabold tracking-wide">
                                                            Send OTP & Verify
                                                        </Text>
                                                    </>
                                                )}
                                            </TouchableOpacity>

                                            <Text className="text-slate-500 text-xs text-center mt-3">
                                                We'll send a verification code to your phone
                                            </Text>
                                        </View>
                                    )}
                                </Formik>
                            </KeyboardAvoidingView>
                        )}

                        {/* ── Step 2: OTP Input + Verify & Book ── */}
                        {otpStep === "otp" && (
                            <View className="px-6 pt-5">
                                <Text className="text-orange-400 text-xs font-bold tracking-widest uppercase mb-3">
                                    Verify Your Phone
                                </Text>
                                <Text className="text-slate-400 text-sm mb-4">
                                    Enter the 6-digit code sent to{" "}
                                    <Text className="text-orange-400 font-bold">
                                        +91 {pendingValues?.mobileNumber}
                                    </Text>
                                </Text>

                                {/* OTP Input */}
                                <View className="flex-row items-center bg-white/5 rounded-xl px-3.5 h-14 gap-2.5 border border-orange-400/25 mb-4">
                                    <Ionicons name="keypad-outline" size={18} color="#fb923c" />
                                    <TextInput
                                        value={otpCode}
                                        onChangeText={setOtpCode}
                                        placeholder="Enter 6-digit OTP"
                                        placeholderTextColor="#475569"
                                        keyboardType="number-pad"
                                        maxLength={6}
                                        className="flex-1 text-slate-50 text-lg font-bold tracking-[8px]"
                                        autoFocus
                                    />
                                </View>

                                {/* Verify & Book */}
                                <TouchableOpacity
                                    onPress={handleVerifyOTP}
                                    activeOpacity={0.85}
                                    disabled={verifyLoading || otpCode.length !== 6}
                                    className={`rounded-2xl h-14 flex-row items-center justify-center gap-2 ${verifyLoading || otpCode.length !== 6
                                            ? "bg-orange-400/50"
                                            : "bg-orange-400"
                                        }`}
                                >
                                    {verifyLoading ? (
                                        <ActivityIndicator color="#0f172a" />
                                    ) : (
                                        <>
                                            <Ionicons name="checkmark-circle" size={20} color="#0f172a" />
                                            <Text className="text-slate-950 text-base font-extrabold tracking-wide">
                                                Verify & Book
                                            </Text>
                                        </>
                                    )}
                                </TouchableOpacity>

                                {/* Resend Row */}
                                <View className="flex-row items-center justify-center mt-4 gap-1">
                                    <Text className="text-slate-500 text-sm">Didn't receive code?</Text>
                                    {resendTimer > 0 ? (
                                        <Text className="text-slate-400 text-sm font-semibold">
                                            Resend in {resendTimer}s
                                        </Text>
                                    ) : (
                                        <TouchableOpacity onPress={handleResendOTP}>
                                            <Text className="text-orange-400 text-sm font-bold">Resend OTP</Text>
                                        </TouchableOpacity>
                                    )}
                                </View>

                                {/* Back to details */}
                                <TouchableOpacity
                                    onPress={() => { setOtpStep("details"); setOtpCode(""); }}
                                    className="mt-3 py-2"
                                >
                                    <Text className="text-slate-500 text-xs text-center underline">
                                        ← Change phone number
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </Animated.View>
                </TouchableOpacity>
            </TouchableOpacity>
        </Modal>
    );
};

export default GuestBookingModal;
