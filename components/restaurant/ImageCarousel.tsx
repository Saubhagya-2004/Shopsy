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
                            <View style={{ position: 'absolute', left: 12, top: '50%', marginTop: -18 ,borderColor:'orange',}}>
                                <CarouselArrow direction="left" onPress={goToPrev} />
                            </View>
                            <View style={{ position: 'absolute', right: 12, top: '50%', marginTop: -18 }}>
                                <CarouselArrow direction="right" onPress={goToNext} />
                            </View>
                        </>
                    )}

                    {/* Dots */}
                    <View style={{ position: 'absolute', bottom: 16, left: 0, right: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                        {images.map((_: any, i: number) => (
                            <TouchableOpacity
                                key={i}
                                onPress={() => {
                                    carouselRef.current?.scrollToIndex({ index: i, animated: true });
                                    setActiveSlide(i);
                                }}
                                style={{
                                    borderRadius: 999,
                                    height: 8,
                                    width: i === activeSlide ? 20 : 8,
                                    backgroundColor: i === activeSlide ? 'orange' : 'rgba(255,255,255,0.5)',
                                }}
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
                style={{ position: 'absolute', top: 48, left: 16, zIndex: 30, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.5)', borderWidth: 2, borderColor: '#fb923c', alignItems: 'center', justifyContent: 'center' }}
            >
                <Ionicons name="arrow-back" size={20} color="#fb923c" />
            </TouchableOpacity>
        </View>
    );
};

export default ImageCarousel;
