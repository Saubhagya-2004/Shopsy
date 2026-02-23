import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
    Dimensions,
    FlatList,
    Image,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import CarouselArrow from "./CarouselArrow";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

type Props = {
    images: string[];
    fallbackImage?: string;
};

const ImageCarousel = ({ images, fallbackImage }: Props) => {
    const router = useRouter();
    const [activeSlide, setActiveSlide] = useState(0);
    const carouselRef = useRef<FlatList>(null);

    // Auto-play
    useEffect(() => {
        if (images.length <= 1) return;
        const timer = setInterval(() => {
            setActiveSlide((prev) => {
                const next = (prev + 1) % images.length;
                carouselRef.current?.scrollToIndex({ index: next, animated: true });
                return next;
            });
        }, 3000);
        return () => clearInterval(timer);
    }, [images.length]);

    const goToPrev = useCallback(() => {
        setActiveSlide((prev) => {
            const next = prev === 0 ? images.length - 1 : prev - 1;
            carouselRef.current?.scrollToIndex({ index: next, animated: true });
            return next;
        });
    }, [images.length]);

    const goToNext = useCallback(() => {
        setActiveSlide((prev) => {
            const next = (prev + 1) % images.length;
            carouselRef.current?.scrollToIndex({ index: next, animated: true });
            return next;
        });
    }, [images.length]);

    const onViewableItemsChanged = useCallback(({ viewableItems }: any) => {
        if (viewableItems.length > 0) setActiveSlide(viewableItems[0].index ?? 0);
    }, []);

    const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

    return (
        <View style={{ width: SCREEN_WIDTH, height: 320 }} className="bg-slate-800">
            {images.length > 0 ? (
                <>
                    <FlatList
                        ref={carouselRef}
                        data={images}
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        keyExtractor={(_, i) => i.toString()}
                        getItemLayout={(_, i) => ({
                            length: SCREEN_WIDTH,
                            offset: SCREEN_WIDTH * i,
                            index: i,
                        })}
                        onViewableItemsChanged={onViewableItemsChanged}
                        viewabilityConfig={viewabilityConfig}
                        renderItem={({ item: uri }: { item: string }) => (
                            <Image
                                source={{ uri }}
                                style={{ width: SCREEN_WIDTH, height: 320 }}
                                resizeMode="cover"
                            />
                        )}
                    />

                    {images.length > 1 && (
                        <>
                            <View className="absolute left-3 top-1/2 -translate-y-4">
                                <CarouselArrow direction="left" onPress={goToPrev} />
                            </View>
                            <View className="absolute right-3 top-1/2 -translate-y-4">
                                <CarouselArrow direction="right" onPress={goToNext} />
                            </View>
                        </>
                    )}

                    {/* Dots */}
                    <View className="absolute bottom-4 self-center flex-row items-center gap-1.5">
                        {images.map((_: any, i: number) => (
                            <TouchableOpacity
                                key={i}
                                onPress={() => {
                                    carouselRef.current?.scrollToIndex({ index: i, animated: true });
                                    setActiveSlide(i);
                                }}
                                className={`rounded-full h-2 ${i === activeSlide ? "w-5 bg-orange-400" : "w-2 bg-white/50"
                                    }`}
                            />
                        ))}
                    </View>

                    {/* Counter */}
                    <View className="absolute top-4 right-4 bg-black/55 px-2.5 py-1 rounded-full">
                        <Text className="text-white text-xs font-semibold">
                            {activeSlide + 1} / {images.length}
                        </Text>
                    </View>
                </>
            ) : fallbackImage ? (
                <Image
                    source={{ uri: fallbackImage }}
                    style={{ width: SCREEN_WIDTH, height: 320 }}
                    resizeMode="cover"
                />
            ) : null}

            {/* Back Button */}
            <TouchableOpacity
                onPress={() => router.back()}
                activeOpacity={0.8}
                className="absolute top-12 left-4 z-30 w-10 h-10 rounded-full bg-black/50 border-2 border-orange-400 items-center justify-center"
            >
                <Ionicons name="arrow-back" size={20} color="#fb923c" />
            </TouchableOpacity>
        </View>
    );
};

export default ImageCarousel;
