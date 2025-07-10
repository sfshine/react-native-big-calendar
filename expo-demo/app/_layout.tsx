import { Stack } from 'expo-router'

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="CalendarDemo" options={{ headerShown: false }} />
    </Stack>
  )
}
