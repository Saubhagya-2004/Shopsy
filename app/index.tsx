import { useRouter } from 'expo-router'
import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native'

export default function index() {
  const router = useRouter();
  return (
    <View>
      <Text> textInComponent </Text>
      <TouchableOpacity onPress={()=>router.push("/Home")}>
          <Text className='text-2xl text-red-500 text-center'>Go to next page</Text>
      </TouchableOpacity>
    </View>
  )
}
