import { Pressable, StyleSheet, Text, View } from "react-native";

import { useI18n } from "../i18n";
import { palette, radius, spacing } from "../utils/constants";

const options = [
  { value: "en", label: "EN" },
  { value: "zh", label: "中" },
] as const;

export function LanguageToggle() {
  const { language, setLanguage } = useI18n();

  return (
    <View style={styles.shell}>
      {options.map((option) => {
        const active = option.value === language;

        return (
          <Pressable
            key={option.value}
            style={[styles.option, active ? styles.optionActive : null]}
            onPress={() => setLanguage(option.value)}
          >
            <Text style={[styles.optionLabel, active ? styles.optionLabelActive : null]}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    flexDirection: "row",
    alignSelf: "flex-end",
    padding: 4,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: palette.line,
    backgroundColor: palette.cardMuted,
    gap: 4,
  },
  option: {
    minWidth: 44,
    minHeight: 34,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
  },
  optionActive: {
    backgroundColor: palette.accent,
  },
  optionLabel: {
    color: palette.textMuted,
    fontSize: 13,
    fontFamily: "SpaceGrotesk_700Bold",
  },
  optionLabelActive: {
    color: palette.bg,
  },
});
