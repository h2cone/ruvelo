import { useEffect, useState } from "react";
import { Easing, runOnJS, useAnimatedReaction, useSharedValue, withTiming } from "react-native-reanimated";

export function useAnimatedValue(value: number, duration = 600) {
  const shared = useSharedValue(value);
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    shared.value = withTiming(value, {
      duration,
      easing: Easing.out(Easing.cubic),
    });
  }, [duration, shared, value]);

  useAnimatedReaction(
    () => shared.value,
    (next) => {
      runOnJS(setDisplayValue)(next);
    }
  );

  return displayValue;
}
