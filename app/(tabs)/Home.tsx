import { Colors } from '@/constants/theme'
import { StatusBar } from 'expo-status-bar'
import React, { Component } from 'react'
import { Text, View, StatusBar as RNStatusBar } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function Home() {

    return (
      <SafeAreaView style={{backgroundColor:'#e5d7c7'}}>
       <RNStatusBar backgroundColor="gray" barStyle="light-content" />

        <View className=''>
        <Text > Home </Text>
      </View>
      </SafeAreaView>
    )
  
}
