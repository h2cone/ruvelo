import { router } from "expo-router";
import { useMemo } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AnimatedCounter } from "../src/components/AnimatedCounter";
import { LanguageToggle } from "../src/components/LanguageToggle";
import { RunCard } from "../src/components/RunCard";
import { StartButton } from "../src/components/StartButton";
import { useRecentRuns } from "../src/hooks/useRecentRuns";
import { useI18n } from "../src/i18n";
import { palette, radius, spacing } from "../src/utils/constants";
import { formatDistance, formatDistanceCompact } from "../src/utils/format";

export default function HomeScreen() {
  const { runs, loading, error } = useRecentRuns();
  const { language, t, translateText } = useI18n();

  const weeklySummary = useMemo(() => {
    const since = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const recent = runs.filter((run) => run.startedAt >= since);
    return {
      count: recent.length,
      distance: recent.reduce((sum, run) => sum + run.distance, 0),
    };
  }, [runs]);

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <View style={styles.backgroundOrbA} />
      <View style={styles.backgroundOrbB} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <LanguageToggle />
        </View>

        <View style={styles.hero}>
          <Text style={styles.eyebrow}>{t("home.eyebrow")}</Text>
          <Text style={styles.title}>{t("home.title")}</Text>
          <Text style={styles.body}>{t("home.body")}</Text>
        </View>

        <View style={styles.summaryCard}>
          <View style={styles.summaryBlock}>
            <Text style={styles.summaryLabel}>{t("home.weekDistance")}</Text>
            <AnimatedCounter
              value={weeklySummary.distance / 1000}
              formatter={(value) => formatDistance(value * 1000, 1, language)}
              style={styles.summaryValue}
            />
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryBlock}>
            <Text style={styles.summaryLabel}>{t("home.runsCompleted")}</Text>
            <AnimatedCounter value={weeklySummary.count} style={styles.summaryValue} />
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t("home.recentRuns")}</Text>
          {runs.length > 0 ? <Text style={styles.sectionHint}>{t("home.recentRunsHint")}</Text> : null}
        </View>

        {loading ? (
          <View style={styles.loadingShell}>
            <ActivityIndicator color={palette.accent} />
            <Text style={styles.loadingText}>{t("home.loadingRuns")}</Text>
          </View>
        ) : runs.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>{t("home.emptyTitle")}</Text>
            <Text style={styles.emptyBody}>{t("home.emptyBody")}</Text>
          </View>
        ) : (
          <View style={styles.runList}>
            {runs.map((run) => (
              <RunCard key={run.id} run={run} onPress={() => router.push(`/summary/${run.id}`)} />
            ))}
          </View>
        )}

        {error ? <Text style={styles.errorText}>{translateText(error)}</Text> : null}

        <View style={styles.ctaSection}>
          <StartButton onPress={() => router.push("/run")} />
          <Pressable style={styles.secondaryCta} onPress={() => router.push("/run")}>
            <Text style={styles.secondaryCtaLabel}>
              {runs[0]
                ? t("home.startNowWithLastRun", {
                    distance: formatDistanceCompact(runs[0].distance, language),
                  })
                : t("home.startNow")}
            </Text>
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
    paddingBottom: 56,
    gap: spacing.xl,
  },
  topBar: {
    alignItems: "flex-end",
  },
  backgroundOrbA: {
    position: "absolute",
    top: -80,
    right: -20,
    width: 220,
    height: 220,
    borderRadius: 999,
    backgroundColor: "rgba(158,255,84,0.12)",
  },
  backgroundOrbB: {
    position: "absolute",
    top: 260,
    left: -80,
    width: 180,
    height: 180,
    borderRadius: 999,
    backgroundColor: "rgba(90,230,255,0.12)",
  },
  hero: {
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  eyebrow: {
    color: palette.accent,
    fontSize: 12,
    letterSpacing: 3,
    textTransform: "uppercase",
    fontFamily: "SpaceGrotesk_700Bold",
  },
  title: {
    color: palette.text,
    fontSize: 38,
    lineHeight: 42,
    fontFamily: "Orbitron_600SemiBold",
  },
  body: {
    color: palette.textMuted,
    fontSize: 16,
    lineHeight: 24,
    fontFamily: "SpaceGrotesk_400Regular",
  },
  summaryCard: {
    flexDirection: "row",
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: palette.line,
    backgroundColor: palette.card,
    overflow: "hidden",
  },
  summaryBlock: {
    flex: 1,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  summaryDivider: {
    width: 1,
    backgroundColor: palette.line,
  },
  summaryLabel: {
    color: palette.textMuted,
    fontSize: 12,
    letterSpacing: 1.4,
    textTransform: "uppercase",
    fontFamily: "SpaceGrotesk_500Medium",
  },
  summaryValue: {
    color: palette.text,
    fontSize: 28,
    fontFamily: "Orbitron_600SemiBold",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  sectionTitle: {
    color: palette.text,
    fontSize: 22,
    fontFamily: "SpaceGrotesk_700Bold",
  },
  sectionHint: {
    color: palette.textMuted,
    fontSize: 13,
    fontFamily: "SpaceGrotesk_400Regular",
  },
  loadingShell: {
    paddingVertical: spacing.xl,
    alignItems: "center",
    gap: spacing.sm,
  },
  loadingText: {
    color: palette.textMuted,
    fontFamily: "SpaceGrotesk_400Regular",
  },
  emptyCard: {
    padding: spacing.xl,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: palette.line,
    backgroundColor: palette.cardMuted,
    gap: spacing.sm,
  },
  emptyTitle: {
    color: palette.text,
    fontSize: 22,
    fontFamily: "SpaceGrotesk_700Bold",
  },
  emptyBody: {
    color: palette.textMuted,
    lineHeight: 24,
    fontFamily: "SpaceGrotesk_400Regular",
  },
  runList: {
    gap: spacing.md,
  },
  errorText: {
    color: palette.danger,
    fontFamily: "SpaceGrotesk_500Medium",
  },
  ctaSection: {
    paddingTop: spacing.md,
    alignItems: "center",
    gap: spacing.md,
  },
  secondaryCta: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: palette.line,
    backgroundColor: palette.cardMuted,
  },
  secondaryCtaLabel: {
    color: palette.text,
    fontFamily: "SpaceGrotesk_500Medium",
  },
});
