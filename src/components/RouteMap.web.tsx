import { StyleSheet, Text, View } from "react-native";

import { useI18n } from "../i18n";
import type { Coordinate } from "../types/run";
import { palette, radius, spacing } from "../utils/constants";

interface RouteMapProps {
  route: Coordinate[];
}

export function RouteMap({ route }: RouteMapProps) {
  const { t } = useI18n();

  if (route.length === 0) {
    return (
      <View style={[styles.placeholder, styles.shell]}>
        <Text style={styles.placeholderTitle}>{t("map.noRoute")}</Text>
        <Text style={styles.placeholderBody}>{t("map.completeRunFirst")}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.placeholder, styles.shell]}>
      <Text style={styles.placeholderTitle}>{t("map.webDisabled")}</Text>
      <Text style={styles.placeholderBody}>{t("map.webBody", { count: route.length })}</Text>
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
