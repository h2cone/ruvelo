import { StyleSheet, Text, View } from "react-native";

import { Coordinate } from "../types/run";
import { palette, radius, spacing } from "../utils/constants";

interface RouteMapProps {
  route: Coordinate[];
}

export function RouteMap({ route }: RouteMapProps) {
  if (route.length === 0) {
    return (
      <View style={[styles.placeholder, styles.shell]}>
        <Text style={styles.placeholderTitle}>No route yet</Text>
        <Text style={styles.placeholderBody}>Complete a run first to view the route replay.</Text>
      </View>
    );
  }

  return (
    <View style={[styles.placeholder, styles.shell]}>
      <Text style={styles.placeholderTitle}>Map preview is disabled on web</Text>
      <Text style={styles.placeholderBody}>
        This run contains {route.length} route points. Open it on Android or iOS to see the full map.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    overflow: "hidden",
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: palette.line,
    backgroundColor: palette.cardMuted,
  },
  placeholder: {
    minHeight: 220,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
    gap: spacing.sm,
  },
  placeholderTitle: {
    color: palette.text,
    fontSize: 20,
    fontFamily: "SpaceGrotesk_700Bold",
  },
  placeholderBody: {
    color: palette.textMuted,
    textAlign: "center",
    lineHeight: 22,
    fontFamily: "SpaceGrotesk_400Regular",
  },
});
