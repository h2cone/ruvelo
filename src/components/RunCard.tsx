import { Pressable, StyleSheet, Text, View } from "react-native";

import { useI18n } from "../i18n";
import { Run } from "../types/run";
import {
  formatClock,
  formatDistanceCompact,
  formatDuration,
  formatPaceWithUnit,
  formatWeekday,
} from "../utils/format";
import { palette, radius, spacing } from "../utils/constants";

interface RunCardProps {
  run: Run;
  onPress: () => void;
}

export function RunCard({ run, onPress }: RunCardProps) {
  const { language, t } = useI18n();

  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.header}>
        <View>
          <Text style={styles.date}>{formatWeekday(run.startedAt, language)}</Text>
          <Text style={styles.time}>{formatClock(run.startedAt, language)}</Text>
        </View>
        <Text style={styles.distance}>{formatDistanceCompact(run.distance, language)}</Text>
      </View>
      <View style={styles.stats}>
        <View style={styles.stat}>
          <Text style={styles.label}>{t("runCard.duration")}</Text>
          <Text style={styles.value}>{formatDuration(run.duration)}</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.label}>{t("runCard.avgPace")}</Text>
          <Text style={styles.value}>{formatPaceWithUnit(run.avgPace, language)}</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: palette.card,
    borderWidth: 1,
    borderColor: palette.line,
    gap: spacing.md,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  date: {
    color: palette.text,
    fontSize: 18,
    fontFamily: "SpaceGrotesk_700Bold",
  },
  time: {
    marginTop: 4,
    color: palette.textMuted,
    fontSize: 13,
    fontFamily: "SpaceGrotesk_400Regular",
  },
  distance: {
    color: palette.accent,
    fontSize: 24,
    fontFamily: "Orbitron_600SemiBold",
  },
  stats: {
    flexDirection: "row",
    gap: spacing.md,
  },
  stat: {
    flex: 1,
  },
  label: {
    color: palette.textMuted,
    fontSize: 12,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    fontFamily: "SpaceGrotesk_500Medium",
  },
  value: {
    marginTop: 4,
    color: palette.text,
    fontSize: 18,
    fontFamily: "Orbitron_600SemiBold",
  },
});
