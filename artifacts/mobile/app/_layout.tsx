import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as Linking from "expo-linking";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { PermissionsGate } from "@/components/PermissionsGate";
import { TutorialOverlay } from "@/components/TutorialOverlay";
import { PlayerProvider, usePlayer } from "@/context/PlayerContext";
import { ThemeProvider } from "@/context/ThemeContext";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function ShareIntentHandler() {
  const { setPendingShareUrl } = usePlayer();

  useEffect(() => {
    const isVideoUrl = (url: string) =>
      url.startsWith("http://") || url.startsWith("https://");

    Linking.getInitialURL().then((url) => {
      if (url && isVideoUrl(url)) {
        setPendingShareUrl(url);
      }
    });

    const sub = Linking.addEventListener("url", ({ url }) => {
      if (url && isVideoUrl(url)) {
        setPendingShareUrl(url);
      }
    });

    return () => sub.remove();
  }, []);

  return null;
}

function RootLayoutNav() {
  return (
    <>
      <ShareIntentHandler />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: "#0A0A0A" } }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="player"
          options={{
            headerShown: false,
            presentation: "card",
            animation: "slide_from_bottom",
          }}
        />
        <Stack.Screen
          name="privacy-policy"
          options={{
            headerShown: false,
            presentation: "card",
            animation: "slide_from_right",
          }}
        />
        <Stack.Screen name="+not-found" />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <ErrorBoundary>
          <QueryClientProvider client={queryClient}>
            <GestureHandlerRootView style={{ flex: 1 }}>
              <KeyboardProvider>
                <PlayerProvider>
                  <PermissionsGate>
                    <RootLayoutNav />
                    <TutorialOverlay />
                  </PermissionsGate>
                </PlayerProvider>
              </KeyboardProvider>
            </GestureHandlerRootView>
          </QueryClientProvider>
        </ErrorBoundary>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
