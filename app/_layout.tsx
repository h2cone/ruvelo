import { Orbitron_600SemiBold, useFonts as useOrbitron } from "@expo-google-fonts/orbitron";
import {
  SpaceGrotesk_400Regular,
  SpaceGrotesk_500Medium,
  SpaceGrotesk_700Bold,
  useFonts as useSpaceGrotesk,
} from "@expo-google-fonts/space-grotesk";
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
  const [orbitronLoaded] = useOrbitron({
    Orbitron_600SemiBold,
  });
  const [spaceGroteskLoaded] = useSpaceGrotesk({
    SpaceGrotesk_400Regular,
    SpaceGrotesk_500Medium,
    SpaceGrotesk_700Bold,
  });

  useEffect(() => {
    initializeDatabase().catch((error) => {
      console.error("Failed to initialize database", error);
    });
  }, []);

  useEffect(() => {
    if (orbitronLoaded && spaceGroteskLoaded) {
      SplashScreen.hideAsync().catch(() => undefined);
    }
  }, [orbitronLoaded, spaceGroteskLoaded]);

  if (!orbitronLoaded || !spaceGroteskLoaded) {
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
