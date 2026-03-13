import { router, useLocalSearchParams } from "expo-router";
import { Share, StyleSheet, Text, Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInUp } from "react-native-reanimated";

import { LanguageToggle } from "../../src/components/LanguageToggle";
import { RouteMap } from "../../src/components/RouteMap";
import { StatBadge } from "../../src/components/StatBadge";
import { useRunById } from "../../src/hooks/useRunById";
import { useI18n } from "../../src/i18n";
import { palette, radius, spacing } from "../../src/utils/constants";
import {
  formatDistance,
  formatDuration,
  formatPaceWithUnit,
  formatWeekday,
} from "../../src/utils/format";

export default function SummaryScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const { run, loading, error } = useRunById(params.id);
  const { language, t, translateText } = useI18n();

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.topBar}>
          <LanguageToggle />
        </View>
        <View style={styles.centerShell}>
          <Text style={styles.title}>{t("summary.loading")}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!run || error) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.topBar}>
          <LanguageToggle />
        </View>
        <View style={styles.centerShell}>
          <Text style={styles.title}>{t("summary.notFound")}</Text>
          <Text style={styles.subtitle}>
            {error ? translateText(error) : t("summary.notFoundBody")}
          </Text>
          <Pressable style={styles.secondaryButton} onPress={() => router.replace("/")}>
            <Text style={styles.secondaryLabel}>{t("summary.backHome")}</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.contentTopBar}>
          <LanguageToggle />
        </View>

        <View style={styles.header}>
          <Text style={styles.eyebrow}>{t("summary.eyebrow")}</Text>
          <Text style={styles.title}>{t("summary.title")}</Text>
          <Text style={styles.subtitle}>
            {t("summary.headerMeta", {
              date: formatWeekday(run.startedAt, language),
              count: run.route.length,
            })}
          </Text>
        </View>

        <Animated.View entering={FadeInUp.duration(450)} style={styles.mapBlock}>
          <RouteMap route={run.route} />
        </Animated.View>

        <View style={styles.badgeRow}>
          <Animated.View entering={FadeInUp.delay(120).duration(420)} style={styles.badgeItem}>
            <StatBadge
              label={t("summary.distance")}
              value={run.distance}
              formatter={(value) => formatDistance(value, 2, language)}
            />
          </Animated.View>
          <Animated.View entering={FadeInUp.delay(220).duration(420)} style={styles.badgeItem}>
            <StatBadge
              label={t("summary.duration")}
              value={run.duration}
              tone="warm"
              formatter={(value) => formatDuration(Math.round(value))}
            />
          </Animated.View>
        </View>

        <Animated.View entering={FadeInUp.delay(320).duration(420)} style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>{t("summary.titleCard")}</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{t("summary.averagePace")}</Text>
            <Text style={styles.summaryValue}>{formatPaceWithUnit(run.avgPace, language)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{t("summary.finished")}</Text>
            <Text style={styles.summaryValue}>{formatWeekday(run.endedAt, language)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{t("summary.totalDistance")}</Text>
            <Text style={styles.summaryValue}>{formatDistance(run.distance, 2, language)}</Text>
          </View>
        </Animated.View>

        <View style={styles.actions}>
          <Pressable
            style={styles.primaryButton}
            onPress={() => {
              Share.share({
                message: t("summary.shareMessage", {
                  distance: formatDistance(run.distance, 2, language),
                  duration: formatDuration(run.duration),
                  pace: formatPaceWithUnit(run.avgPace, language),
                }),
              }).catch(() => undefined);
            }}
          >
            <Text style={styles.primaryLabel}>{t("summary.share")}</Text>
          </Pressable>
          <Pressable style={styles.secondaryButton} onPress={() => router.replace("/")}>
            <Text style={styles.secondaryLabel}>{t("summary.backHome")}</Text>
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
  topBar: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    alignItems: "flex-end",
  },
  contentTopBar: {
    alignItems: "flex-end",
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
