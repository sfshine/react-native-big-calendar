import { Stack } from 'expo-router'
import { GestureHandlerRootView } from 'react-native-gesture-handler'

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="CalendarDemo" options={{ headerShown: false }} />
        <Stack.Screen name="MonthViewPagerPage" options={{ headerShown: false }} />
        <Stack.Screen name="ThreeDaysViewPagerPage" options={{ headerShown: false }} />
        <Stack.Screen name="MonthViewInfinitePagerTest" options={{ headerShown: false }} />
        <Stack.Screen name="CalendarManager" options={{ headerShown: false }} />
      </Stack>
    </GestureHandlerRootView>
  )
}
