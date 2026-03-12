import * as Haptics from "expo-haptics";
import { Pressable, StyleSheet, Text } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";

import { palette, radius, shadows, spacing } from "../utils/constants";

interface StartButtonProps {
  onPress: () => void;
  disabled?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function StartButton({ onPress, disabled }: StartButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      disabled={disabled}
      style={[styles.button, animatedStyle, disabled ? styles.buttonDisabled : null]}
      onPressIn={() => {
        scale.value = withSpring(0.95);
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 12 });
      }}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => undefined);
        onPress();
      }}
    >
      <Text style={styles.kicker}>RUVELO</Text>
      <Text style={styles.label}>Start Run</Text>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    justifyContent: "center",
    width: 176,
    height: 176,
    borderRadius: radius.pill,
    backgroundColor: palette.accent,
    alignSelf: "center",
    ...shadows.glow,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  kicker: {
    color: palette.bg,
    fontSize: 12,
    letterSpacing: 3.2,
    textTransform: "uppercase",
    fontFamily: "SpaceGrotesk_700Bold",
  },
  label: {
    marginTop: spacing.xs,
    color: palette.bg,
    fontSize: 26,
    fontFamily: "Orbitron_600SemiBold",
  },
});
