import { useEffect } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { StatBadge } from "../src/components/StatBadge";
import { useRun } from "../src/hooks/useRun";
import { supportsBackgroundTracking } from "../src/services/location";
import { palette, radius, spacing } from "../src/utils/constants";
import { formatDistance, formatDuration, formatPace } from "../src/utils/format";

export default function RunScreen() {
  const {
    phase,
    elapsedSeconds,
    distance,
    currentPace,
    error,
    isBusy,
    startRun,
    pauseRun,
    resumeRun,
    finishRun,
    clearError,
  } = useRun();

  useEffect(() => {
    if (phase === "idle" && !error) {
      startRun().catch(() => undefined);
    }
  }, [error, phase, startRun]);

  const isRunning = phase === "running";
  const isPaused = phase === "paused";
  const backgroundTrackingEnabled = supportsBackgroundTracking();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.gridGlow} />
      <View style={styles.header}>
        <Text style={styles.headerKicker}>LIVE RUN</Text>
        <Text style={styles.headerTitle}>{isPaused ? "Paused" : "Recording"}</Text>
      </View>

      <View style={styles.timerShell}>
        <Text style={styles.timerLabel}>TIME</Text>
        <Text style={styles.timerValue}>{formatDuration(elapsedSeconds)}</Text>
      </View>

      <View style={styles.statsRow}>
        <StatBadge
          label="Distance"
          value={distance}
          tone="accent"
          formatter={(value) => formatDistance(value, 2)}
        />
        <StatBadge
          label="Current Pace"
          value={currentPace ?? 0}
          tone="cool"
          formatter={(value) => `${formatPace(value)}/km`}
        />
      </View>

      <View style={styles.statusCard}>
        {isBusy ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator color={palette.accent} />
            <Text style={styles.statusText}>Connecting to location services...</Text>
          </View>
        ) : (
          <Text style={styles.statusText}>
            {isPaused
              ? "The timer is paused and route tracking has stopped. Resume to continue this run."
              : backgroundTrackingEnabled
                ? "Tracking will continue through background location when the screen is off. Long-press finish to avoid accidental taps."
                : "Expo Go can only track while this screen stays active. Use an iOS development build to keep recording with the screen off."}
          </Text>
        )}
        {error ? (
          <Pressable
            style={styles.errorCard}
            onPress={() => {
              clearError();
              startRun().catch(() => undefined);
            }}
          >
            <Text style={styles.errorTitle}>Failed to start location tracking</Text>
            <Text style={styles.errorBody}>{error}</Text>
            <Text style={styles.errorAction}>Tap to retry</Text>
          </Pressable>
        ) : null}
      </View>

      <View style={styles.actions}>
        <Pressable
          disabled={isBusy || phase === "idle"}
          style={[styles.secondaryButton, isBusy ? styles.buttonDisabled : null]}
          onPress={() => {
            if (isRunning) {
              pauseRun().catch(() => undefined);
            } else if (isPaused) {
              resumeRun().catch(() => undefined);
            }
          }}
        >
          <Text style={styles.secondaryLabel}>{isPaused ? "Resume" : "Pause"}</Text>
        </Pressable>

        <Pressable
          disabled={isBusy || phase === "idle"}
          style={[styles.primaryButton, isBusy ? styles.buttonDisabled : null]}
          delayLongPress={900}
          onLongPress={() => {
            finishRun().catch(() => undefined);
          }}
        >
          <Text style={styles.primaryKicker}>Long press to finish</Text>
          <Text style={styles.primaryLabel}>End this run</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
    backgroundColor: palette.bg,
    justifyContent: "space-between",
  },
  gridGlow: {
    position: "absolute",
    top: 140,
    right: -20,
    width: 260,
    height: 260,
    borderRadius: 999,
    backgroundColor: "rgba(255,122,89,0.1)",
  },
  header: {
    gap: spacing.xs,
  },
  headerKicker: {
    color: palette.accentCool,
    fontSize: 12,
    letterSpacing: 3,
    textTransform: "uppercase",
    fontFamily: "SpaceGrotesk_700Bold",
  },
  headerTitle: {
    color: palette.text,
    fontSize: 28,
    fontFamily: "SpaceGrotesk_700Bold",
  },
  timerShell: {
    alignItems: "center",
    gap: spacing.sm,
  },
  timerLabel: {
    color: palette.textMuted,
    fontSize: 14,
    letterSpacing: 4,
    textTransform: "uppercase",
    fontFamily: "SpaceGrotesk_500Medium",
  },
  timerValue: {
    color: palette.text,
    fontSize: 68,
    letterSpacing: 1,
    fontFamily: "Orbitron_600SemiBold",
  },
  statsRow: {
    flexDirection: "row",
    gap: spacing.md,
  },
  statusCard: {
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: palette.line,
    backgroundColor: palette.card,
    gap: spacing.md,
  },
  statusText: {
    color: palette.textMuted,
    lineHeight: 24,
    fontFamily: "SpaceGrotesk_400Regular",
  },
  loadingRow: {
    flexDirection: "row",
    gap: spacing.sm,
    alignItems: "center",
  },
  errorCard: {
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: "rgba(255,97,117,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,97,117,0.22)",
    gap: spacing.xs,
  },
  errorTitle: {
    color: palette.text,
    fontFamily: "SpaceGrotesk_700Bold",
  },
  errorBody: {
    color: palette.textMuted,
    lineHeight: 22,
    fontFamily: "SpaceGrotesk_400Regular",
  },
  errorAction: {
    color: palette.accent,
    fontFamily: "SpaceGrotesk_700Bold",
  },
  actions: {
    gap: spacing.md,
  },
  primaryButton: {
    minHeight: 96,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: palette.accentWarm,
    gap: spacing.xs,
  },
  primaryKicker: {
    color: palette.bg,
    fontSize: 12,
    letterSpacing: 3,
    textTransform: "uppercase",
    fontFamily: "SpaceGrotesk_700Bold",
  },
  primaryLabel: {
    color: palette.bg,
    fontSize: 24,
    fontFamily: "Orbitron_600SemiBold",
  },
  secondaryButton: {
    minHeight: 58,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: palette.cardMuted,
    borderWidth: 1,
    borderColor: palette.line,
  },
  secondaryLabel: {
    color: palette.text,
    fontSize: 16,
    fontFamily: "SpaceGrotesk_700Bold",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
