import { router, useLocalSearchParams } from "expo-router";
import { Share, StyleSheet, Text, Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInUp } from "react-native-reanimated";

import { RouteMap } from "../../src/components/RouteMap";
import { StatBadge } from "../../src/components/StatBadge";
import { useRunById } from "../../src/hooks/useRunById";
import { palette, radius, spacing } from "../../src/utils/constants";
import { formatDistance, formatDuration, formatPace, formatWeekday } from "../../src/utils/format";

export default function SummaryScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const { run, loading, error } = useRunById(params.id);

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerShell}>
          <Text style={styles.title}>Building your summary...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!run || error) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerShell}>
          <Text style={styles.title}>Run not found</Text>
          <Text style={styles.subtitle}>{error ?? "Go back home and start a new run."}</Text>
          <Pressable style={styles.secondaryButton} onPress={() => router.replace("/")}>
            <Text style={styles.secondaryLabel}>Back Home</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>RUN COMPLETE</Text>
          <Text style={styles.title}>This run is complete.</Text>
          <Text style={styles.subtitle}>{formatWeekday(run.startedAt)} · {run.route.length} route points</Text>
        </View>

        <Animated.View entering={FadeInUp.duration(450)} style={styles.mapBlock}>
          <RouteMap route={run.route} />
        </Animated.View>

        <View style={styles.badgeRow}>
          <Animated.View entering={FadeInUp.delay(120).duration(420)} style={styles.badgeItem}>
            <StatBadge label="Distance" value={run.distance} formatter={(value) => formatDistance(value)} />
          </Animated.View>
          <Animated.View entering={FadeInUp.delay(220).duration(420)} style={styles.badgeItem}>
            <StatBadge label="Duration" value={run.duration} tone="warm" formatter={(value) => formatDuration(Math.round(value))} />
          </Animated.View>
        </View>

        <Animated.View entering={FadeInUp.delay(320).duration(420)} style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Average Pace</Text>
            <Text style={styles.summaryValue}>{formatPace(run.avgPace)}/km</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Finished</Text>
            <Text style={styles.summaryValue}>{formatWeekday(run.endedAt)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Distance</Text>
            <Text style={styles.summaryValue}>{formatDistance(run.distance)}</Text>
          </View>
        </Animated.View>

        <View style={styles.actions}>
          <Pressable
            style={styles.primaryButton}
            onPress={() => {
              Share.share({
                message: `I completed a ${formatDistance(run.distance)} run in Ruvelo in ${formatDuration(
                  run.duration
                )}, averaging ${formatPace(run.avgPace)}/km.`,
              }).catch(() => undefined);
            }}
          >
            <Text style={styles.primaryLabel}>Share Summary</Text>
          </Pressable>
          <Pressable style={styles.secondaryButton} onPress={() => router.replace("/")}>
            <Text style={styles.secondaryLabel}>Back Home</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: palette.bg,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: 48,
    gap: spacing.xl,
  },
  centerShell: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
  },
  header: {
    gap: spacing.sm,
  },
  eyebrow: {
    color: palette.accentWarm,
    fontSize: 12,
    letterSpacing: 3,
    textTransform: "uppercase",
    fontFamily: "SpaceGrotesk_700Bold",
  },
  title: {
    color: palette.text,
    fontSize: 34,
    lineHeight: 38,
    fontFamily: "Orbitron_600SemiBold",
  },
  subtitle: {
    color: palette.textMuted,
    lineHeight: 24,
    fontFamily: "SpaceGrotesk_400Regular",
  },
  mapBlock: {
    gap: spacing.md,
  },
  badgeRow: {
    flexDirection: "row",
    gap: spacing.md,
  },
  badgeItem: {
    flex: 1,
  },
  summaryCard: {
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: palette.line,
    backgroundColor: palette.card,
    gap: spacing.md,
  },
  summaryTitle: {
    color: palette.text,
    fontSize: 22,
    fontFamily: "SpaceGrotesk_700Bold",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: palette.line,
  },
  summaryLabel: {
    color: palette.textMuted,
    fontFamily: "SpaceGrotesk_400Regular",
  },
  summaryValue: {
    color: palette.text,
    fontFamily: "Orbitron_600SemiBold",
  },
  actions: {
    gap: spacing.md,
  },
  primaryButton: {
    minHeight: 58,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.pill,
    backgroundColor: palette.accent,
  },
  primaryLabel: {
    color: palette.bg,
    fontFamily: "SpaceGrotesk_700Bold",
  },
  secondaryButton: {
    minHeight: 58,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.pill,
    backgroundColor: palette.cardMuted,
    borderWidth: 1,
    borderColor: palette.line,
  },
  secondaryLabel: {
    color: palette.text,
    fontFamily: "SpaceGrotesk_700Bold",
  },
});
