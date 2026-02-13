import { Image } from 'expo-image';
import { Platform, StyleSheet, Text, View } from 'react-native';

import { HelloWave } from '@/components/hello-wave';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Link } from 'expo-router';

export default function HomeScreen() {
  return (
   <View className='text-red-500 bg-gray-500 flex justify-center min-h-screen items-center'>
    <Text style={{fontFamily:'appBold'}} className='text-white text-2xl'>Hellobb</Text>
   </View>
  );
}


