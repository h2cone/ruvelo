import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, LayoutChangeEvent, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { LanguageToggle } from "../src/components/LanguageToggle";
import { StatBadge } from "../src/components/StatBadge";
import { useRun } from "../src/hooks/useRun";
import { useI18n } from "../src/i18n";
import { supportsBackgroundTracking } from "../src/services/location";
import { palette, radius, spacing } from "../src/utils/constants";
import { formatDistance, formatDuration, formatPaceWithUnit } from "../src/utils/format";

export default function RunScreen() {
  const finishHoldTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [finishButtonWidth, setFinishButtonWidth] = useState(0);
  const finishHoldOverlayTranslateX = useSharedValue(0);
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
  const { language, t, translateText } = useI18n();

  useEffect(() => {
    if (phase === "idle" && !error) {
      startRun().catch(() => undefined);
    }
  }, [error, phase, startRun]);

  const isRunning = phase === "running";
  const isPaused = phase === "paused";
  const backgroundTrackingEnabled = supportsBackgroundTracking();

  useEffect(() => {
    if (finishButtonWidth > 0) {
      finishHoldOverlayTranslateX.value = -finishButtonWidth;
    }
  }, [finishButtonWidth, finishHoldOverlayTranslateX]);

  useEffect(() => {
    return () => {
      if (finishHoldTimerRef.current) {
        clearTimeout(finishHoldTimerRef.current);
      }
      cancelAnimation(finishHoldOverlayTranslateX);
    };
  }, [finishHoldOverlayTranslateX]);

  const finishHoldOverlayStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: finishHoldOverlayTranslateX.value }],
  }));

  function resetFinishHoldOverlay(duration = 140) {
    if (finishButtonWidth <= 0) {
      finishHoldOverlayTranslateX.value = 0;
      return;
    }

    cancelAnimation(finishHoldOverlayTranslateX);
    finishHoldOverlayTranslateX.value = withTiming(-finishButtonWidth, {
      duration,
      easing: Easing.out(Easing.quad),
    });
  }

  function clearFinishHoldTimer() {
    if (finishHoldTimerRef.current) {
      clearTimeout(finishHoldTimerRef.current);
      finishHoldTimerRef.current = null;
    }

    resetFinishHoldOverlay();
  }

  function startFinishHoldTimer() {
    if (isBusy || phase === "idle" || finishHoldTimerRef.current) {
      return;
    }

    if (finishButtonWidth > 0) {
      cancelAnimation(finishHoldOverlayTranslateX);
      finishHoldOverlayTranslateX.value = -finishButtonWidth;
      finishHoldOverlayTranslateX.value = withTiming(0, {
        duration: 900,
        easing: Easing.linear,
      });
    }

    finishHoldTimerRef.current = setTimeout(() => {
      finishHoldTimerRef.current = null;
      finishRun().catch(() => undefined);
    }, 900);
  }

  function handleFinishButtonLayout(event: LayoutChangeEvent) {
    const width = Math.round(event.nativeEvent.layout.width);
    if (width !== finishButtonWidth) {
      setFinishButtonWidth(width);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.gridGlow} />
      <View style={styles.topBar}>
        <LanguageToggle />
      </View>

      <View style={styles.header}>
        <Text style={styles.headerKicker}>{t("run.live")}</Text>
        <Text style={styles.headerTitle}>{isPaused ? t("run.paused") : t("run.recording")}</Text>
      </View>

      <View style={styles.timerShell}>
        <Text style={styles.timerLabel}>{t("run.time")}</Text>
        <Text style={styles.timerValue}>{formatDuration(elapsedSeconds)}</Text>
      </View>

      <View style={styles.statsRow}>
        <StatBadge
          label={t("run.distance")}
          value={distance}
          tone="accent"
          formatter={(value) => formatDistance(value, 2, language)}
        />
        <StatBadge
          label={t("run.currentPace")}
          value={currentPace ?? 0}
          tone="cool"
          formatter={(value) => formatPaceWithUnit(value, language)}
        />
      </View>

      <View style={styles.statusCard}>
        {isBusy ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator color={palette.accent} />
            <Text style={styles.statusText}>{t("run.connecting")}</Text>
          </View>
        ) : (
          <Text style={styles.statusText}>
            {isPaused
              ? t("run.statusPaused")
              : backgroundTrackingEnabled
                ? t("run.statusBackgroundOn")
                : t("run.statusBackgroundOff")}
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
            <Text style={styles.errorTitle}>{t("run.failedToStartTracking")}</Text>
            <Text style={styles.errorBody}>{translateText(error)}</Text>
            <Text style={styles.errorAction}>{t("run.tapToRetry")}</Text>
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
          <Text style={styles.secondaryLabel}>{isPaused ? t("run.resume") : t("run.pause")}</Text>
        </Pressable>

        <Pressable
          disabled={isBusy || phase === "idle"}
          style={({ pressed }) => [
            styles.primaryButton,
            isBusy ? styles.buttonDisabled : null,
            pressed && !isBusy && phase !== "idle" ? styles.primaryButtonPressed : null,
          ]}
          onLayout={handleFinishButtonLayout}
          onPressIn={startFinishHoldTimer}
          onPressOut={clearFinishHoldTimer}
        >
          <Animated.View
            pointerEvents="none"
            style={[styles.primaryButtonProgress, finishHoldOverlayStyle]}
          />
          <View style={styles.primaryButtonContent}>
            <Text style={styles.primaryKicker}>{t("run.longPressToFinish")}</Text>
            <Text style={styles.primaryLabel}>{t("run.endThisRun")}</Text>
          </View>
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
  topBar: {
    alignItems: "flex-end",
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
    overflow: "hidden",
    backgroundColor: palette.accentWarm,
  },
  primaryButtonPressed: {
    transform: [{ scale: 0.985 }],
  },
  primaryButtonProgress: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(6,17,31,0.2)",
  },
  primaryButtonContent: {
    minHeight: 96,
    alignItems: "center",
    justifyContent: "center",
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
