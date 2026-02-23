import AsyncStorage from "@react-native-async-storage/async-storage";

// Guest phone verification is valid for 24 hours
const VERIFICATION_DURATION_MS = 24 * 60 * 60 * 1000;

/**
 * Check if a phone number was already verified within the session window.
 */
export const isPhoneVerified = async (phone) => {
    try {
        const savedPhone = await AsyncStorage.getItem("guestVerifiedPhone");
        const savedAt = await AsyncStorage.getItem("guestVerifiedAt");
        if (!savedPhone || !savedAt) return false;
        if (savedPhone !== phone) return false;
        const elapsed = Date.now() - parseInt(savedAt, 10);
        return elapsed < VERIFICATION_DURATION_MS;
    } catch {
        return false;
    }
};

/**
 * Cache a verified phone number with the current timestamp.
 */
export const saveVerifiedPhone = async (phone) => {
    await AsyncStorage.setItem("guestVerifiedPhone", phone);
    await AsyncStorage.setItem("guestVerifiedAt", Date.now().toString());
};

/**
 * Clear cached phone verification data.
 */
export const clearVerifiedPhone = async () => {
    await AsyncStorage.removeItem("guestVerifiedPhone");
    await AsyncStorage.removeItem("guestVerifiedAt");
};
