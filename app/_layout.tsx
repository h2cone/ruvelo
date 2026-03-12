import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { Platform, StatusBar } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { initializeDatabase } from "../src/db/client";
import { RunProvider } from "../src/hooks/useRun";
import { palette } from "../src/utils/constants";
import "../src/services/tracking";

SplashScreen.preventAutoHideAsync().catch(() => undefined);

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Orbitron_600SemiBold: require("../assets/fonts/Orbitron_600SemiBold.ttf"),
    SpaceGrotesk_400Regular: require("../assets/fonts/SpaceGrotesk_400Regular.ttf"),
    SpaceGrotesk_500Medium: require("../assets/fonts/SpaceGrotesk_500Medium.ttf"),
    SpaceGrotesk_700Bold: require("../assets/fonts/SpaceGrotesk_700Bold.ttf"),
  });

  useEffect(() => {
    initializeDatabase().catch((error) => {
      console.error("Failed to initialize database", error);
    });
  }, []);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync().catch(() => undefined);
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <StatusBar
        barStyle="light-content"
        backgroundColor={palette.bg}
        translucent={Platform.OS === "android"}
      />
      <RunProvider>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: palette.bg },
            animation: Platform.OS === "ios" ? "ios_from_right" : "fade_from_bottom",
          }}
        />
      </RunProvider>
    </SafeAreaProvider>
  );
}
