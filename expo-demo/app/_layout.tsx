import { Stack } from 'expo-router'

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="CalendarDemo" options={{ headerShown: false }} />
      <Stack.Screen name="MonthViewTestPage" options={{ headerShown: false }} />
    </Stack>
  )
}
