import DateTimePicker from "@react-native-community/datetimepicker";
import React from "react";
import { Modal, Platform, Text, TouchableOpacity, View } from "react-native";

type Props = {
    visible: boolean;
    date: Date;
    onDateChange: (date: Date) => void;
    onConfirm: () => void;
    onCancel: () => void;
};

const DatePickerModal = ({
    visible,
    date,
    onDateChange,
    onConfirm,
    onCancel,
}: Props) => {
    // Android: native picker dialog (no wrapper needed)
    if (Platform.OS === "android") {
        if (!visible) return null;
        return (
            <DateTimePicker
                value={date}
                mode="date"
                display="default"
                onChange={(_, selectedDate) => {
                    onCancel(); // close first (dismiss the picker)
                    if (selectedDate) onDateChange(selectedDate);
                }}
                minimumDate={new Date()}
            />
        );
    }

    // iOS: custom modal with spinner + confirm/cancel
    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onCancel}
        >
            <View className="flex-1 bg-black/60 justify-center p-5">
                <View className="bg-slate-800 rounded-3xl p-5 border border-orange-400/30">
                    <Text className="text-slate-50 text-lg font-bold mb-4 text-center">
                        Select Date
                    </Text>
                    <DateTimePicker
                        value={date}
                        mode="date"
                        display="spinner"
                        onChange={(_, selectedDate) => selectedDate && onDateChange(selectedDate)}
                        minimumDate={new Date()}
                        textColor="#f8fafc"
                    />
                    <View className="flex-row gap-3 mt-4">
                        <TouchableOpacity
                            onPress={onCancel}
                            className="flex-1 py-3 rounded-xl border border-white/15 items-center"
                        >
                            <Text className="text-slate-400 font-semibold">Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={onConfirm}
                            className="flex-1 py-3 rounded-xl bg-orange-400 items-center"
                        >
                            <Text className="text-slate-950 font-bold">Confirm</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

export default DatePickerModal;
