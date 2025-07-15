import { Stack } from 'expo-router'
import { GestureHandlerRootView } from 'react-native-gesture-handler'

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack>
        <Stack.Screen name="CalendarDemo" options={{ headerShown: false }} />
        <Stack.Screen name="MonthViewTestPage" options={{ headerShown: false }} />
      </Stack>
    </GestureHandlerRootView>
  )
}
