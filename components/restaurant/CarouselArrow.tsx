import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { TouchableOpacity } from "react-native";

type Props = {
    direction: "left" | "right";
    onPress: () => void;
};

const CarouselArrow = ({ direction, onPress }: Props) => (
    <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.8}
        className="w-9 h-9 rounded-full bg-black/45 border-2 border-orange-400 items-center justify-center"
    >
        <Ionicons
            name={direction === "left" ? "chevron-back" : "chevron-forward"}
            size={18}
            color="#fb923c"
        />
    </TouchableOpacity>
);

export default CarouselArrow;
