import { StyleSheet, Text, View } from "react-native";

import { AnimatedCounter } from "./AnimatedCounter";
import { palette, radius, spacing } from "../utils/constants";

interface StatBadgeProps {
  label: string;
  value: number;
  formatter?: (value: number) => string;
  tone?: "accent" | "warm" | "cool";
}

const toneMap = {
  accent: palette.accent,
  warm: palette.accentWarm,
  cool: palette.accentCool,
} as const;

export function StatBadge({
  label,
  value,
  formatter,
  tone = "accent",
}: StatBadgeProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <AnimatedCounter
        value={value}
        formatter={formatter}
        style={[styles.value, { color: toneMap[tone] }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minWidth: 120,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    backgroundColor: palette.cardMuted,
    borderWidth: 1,
    borderColor: palette.line,
    gap: spacing.xs,
  },
  label: {
    color: palette.textMuted,
    fontSize: 12,
    letterSpacing: 1.4,
    textTransform: "uppercase",
    fontFamily: "SpaceGrotesk_500Medium",
  },
  value: {
    color: palette.text,
    fontSize: 28,
    fontFamily: "Orbitron_600SemiBold",
  },
});
