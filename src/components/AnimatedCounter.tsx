import { Text, type TextStyle } from "react-native";

import { useAnimatedValue } from "../hooks/useAnimatedValue";

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  style?: TextStyle | TextStyle[];
  formatter?: (value: number) => string;
}

export function AnimatedCounter({
  value,
  duration,
  style,
  formatter = (next) => Math.round(next).toString(),
}: AnimatedCounterProps) {
  const animatedValue = useAnimatedValue(value, duration);

  return <Text style={style}>{formatter(animatedValue)}</Text>;
}
