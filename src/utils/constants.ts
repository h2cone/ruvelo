export const palette = {
  bg: "#06111F",
  bgElevated: "#0D1C31",
  card: "#112742",
  cardMuted: "#0A1830",
  text: "#F6F8FB",
  textMuted: "#9EB1CB",
  accent: "#9EFF54",
  accentWarm: "#FF7A59",
  accentCool: "#5AE6FF",
  line: "rgba(255,255,255,0.08)",
  success: "#73FFA8",
  danger: "#FF6175",
} as const;

export const spacing = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
} as const;

export const radius = {
  sm: 14,
  md: 22,
  lg: 32,
  pill: 999,
} as const;

export const motion = {
  fast: 180,
  base: 320,
  slow: 640,
} as const;

export const shadows = {
  glow: {
    shadowColor: "#9EFF54",
    shadowOpacity: 0.28,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },
} as const;

export const appTheme = {
  pageHorizontal: spacing.lg,
  maxContentWidth: 820,
} as const;
