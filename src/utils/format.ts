import {
  getCurrentLanguage,
  getDistanceUnit,
  getLocale,
  getPaceUnit,
  type Language,
} from "../i18n/config";

export function formatDistance(
  meters: number,
  digits = 2,
  language: Language = getCurrentLanguage(),
) {
  return `${(meters / 1000).toFixed(digits)} ${getDistanceUnit(language, "km")}`;
}

export function formatDistanceCompact(meters: number, language: Language = getCurrentLanguage()) {
  if (meters < 1000) {
    return `${Math.round(meters)} ${getDistanceUnit(language, "m")}`;
  }

  return `${(meters / 1000).toFixed(1)} ${getDistanceUnit(language, "km")}`;
}

export function formatDuration(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return [hours, minutes, seconds].map((value) => value.toString().padStart(2, "0")).join(":");
  }

  return [minutes, seconds].map((value) => value.toString().padStart(2, "0")).join(":");
}

export function formatPace(secondsPerKm: number | null | undefined) {
  if (!secondsPerKm || !Number.isFinite(secondsPerKm) || secondsPerKm <= 0) {
    return "--'--\"";
  }

  const minutes = Math.floor(secondsPerKm / 60);
  const seconds = Math.round(secondsPerKm % 60)
    .toString()
    .padStart(2, "0");

  return `${minutes}'${seconds}"`;
}

export function formatPaceWithUnit(
  secondsPerKm: number | null | undefined,
  language: Language = getCurrentLanguage(),
) {
  return `${formatPace(secondsPerKm)}${getPaceUnit(language)}`;
}

export function formatWeekday(timestamp: number, language: Language = getCurrentLanguage()) {
  return new Date(timestamp).toLocaleDateString(getLocale(language), {
    month: "short",
    day: "numeric",
    weekday: "short",
  });
}

export function formatClock(timestamp: number, language: Language = getCurrentLanguage()) {
  return new Date(timestamp).toLocaleTimeString(getLocale(language), {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}
