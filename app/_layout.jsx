import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <Stack>
        {/* Hide header for all screens to implement custom headers */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="employers/create" options={{ headerShown: false }} />
        <Stack.Screen name="employers/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="candidates/create" options={{ headerShown: false }} />
        <Stack.Screen name="candidates/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="tickets/[id]" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}
