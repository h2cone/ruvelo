export type Language = "en" | "zh";

type TranslationParams = Record<string, string | number>;
type TranslationValue = string | ((params: TranslationParams) => string);

function formatEnglishRoutePoints(count: number) {
  return count === 1 ? "1 route point" : `${count} route points`;
}

const translations = {
  en: {
    "home.eyebrow": "RUVELO / WEEK LOOP",
    "home.title": "Turn every morning run into a level worth replaying.",
    "home.body":
      "Check your recent mileage, start instantly, and finish with a route recap that feels like a game results screen.",
    "home.weekDistance": "7-Day Distance",
    "home.runsCompleted": "Runs Completed",
    "home.recentRuns": "Recent Runs",
    "home.recentRunsHint": "Open a run to replay the summary",
    "home.loadingRuns": "Loading runs...",
    "home.emptyTitle": "Your first run has not started yet",
    "home.emptyBody":
      "Tap the start button below. Ruvelo will record the route, time, and distance, then build a post-run summary screen.",
    "home.startNow": "Start now",
    "home.startNowWithLastRun": ({ distance }) => `Start now · last run ${distance}`,
    "run.live": "Live Run",
    "run.paused": "Paused",
    "run.recording": "Recording",
    "run.time": "Time",
    "run.distance": "Distance",
    "run.currentPace": "Current Pace",
    "run.connecting": "Connecting to location services...",
    "run.statusPaused":
      "The timer is paused and route tracking has stopped. Resume to continue this run.",
    "run.statusBackgroundOn":
      "Tracking will continue through background location when the screen is off. Long-press finish to avoid accidental taps.",
    "run.statusBackgroundOff":
      "Expo Go can only track while this screen stays active. Use an iOS development build to keep recording with the screen off.",
    "run.failedToStartTracking": "Failed to start location tracking",
    "run.tapToRetry": "Tap to retry",
    "run.resume": "Resume",
    "run.pause": "Pause",
    "run.longPressToFinish": "Long press to finish",
    "run.endThisRun": "End this run",
    "summary.loading": "Building your summary...",
    "summary.notFound": "Run not found",
    "summary.notFoundBody": "Go back home and start a new run.",
    "summary.backHome": "Back Home",
    "summary.eyebrow": "Run Complete",
    "summary.title": "This run is complete.",
    "summary.headerMeta": ({ date, count }) =>
      `${date} · ${formatEnglishRoutePoints(Number(count))}`,
    "summary.distance": "Distance",
    "summary.duration": "Duration",
    "summary.titleCard": "Summary",
    "summary.averagePace": "Average Pace",
    "summary.finished": "Finished",
    "summary.totalDistance": "Total Distance",
    "summary.share": "Share Summary",
    "summary.shareMessage": ({ distance, duration, pace }) =>
      `I completed a ${distance} run in Ruvelo in ${duration}, averaging ${pace}.`,
    "map.noRoute": "No route yet",
    "map.completeRunFirst": "Complete a run first to view the route replay.",
    "map.webDisabled": "Map preview is disabled on web",
    "map.webBody": ({ count }) =>
      `This run contains ${formatEnglishRoutePoints(Number(count))}. Open it on Android or iOS to see the full map.`,
    "startButton.label": "Start Run",
    "runCard.duration": "Duration",
    "runCard.avgPace": "Avg Pace",
    "errors.failedToLoadRuns": "Failed to load runs",
    "errors.failedToLoadRunDetails": "Failed to load run details",
    "errors.failedToStartRun": "Failed to start the run",
    "errors.failedToResumeRun": "Failed to resume the run",
    "errors.failedToSaveRun": "Failed to save the run",
    "errors.runStartTimeMissing": "Run start time is missing",
    "errors.foregroundPermissionRequired":
      "Foreground location permission is required to start a run",
    "errors.backgroundPermissionRequired":
      "Background location permission is required to keep tracking with the screen off",
    "errors.browserLocationUnsupported": "This browser does not support location access",
    "tracking.notificationTitle": "Ruvelo is tracking your run",
    "tracking.notificationBody": "Finish the run to see the route and summary screen.",
  },
  zh: {
    "home.eyebrow": "RUVELO / 本周节奏",
    "home.title": "把每天晨跑，变成值得反复回放的一关。",
    "home.body": "查看最近里程，一键开跑，结束后还能看到像游戏结算页一样的路线回放。",
    "home.weekDistance": "7日距离",
    "home.runsCompleted": "完成次数",
    "home.recentRuns": "最近跑步",
    "home.recentRunsHint": "打开一次记录即可回看总结",
    "home.loadingRuns": "正在加载跑步记录...",
    "home.emptyTitle": "你还没有开始第一跑",
    "home.emptyBody": "点下面的开始按钮。Ruvelo 会记录路线、时间和距离，并在结束后生成总结页面。",
    "home.startNow": "立即开跑",
    "home.startNowWithLastRun": ({ distance }) => `立即开跑 · 上次 ${distance}`,
    "run.live": "实时跑步",
    "run.paused": "已暂停",
    "run.recording": "记录中",
    "run.time": "时间",
    "run.distance": "距离",
    "run.currentPace": "当前配速",
    "run.connecting": "正在连接定位服务...",
    "run.statusPaused": "计时已暂停，路线记录也已停止。继续后将接着本次跑步。",
    "run.statusBackgroundOn": "熄屏后仍会通过后台定位持续记录。结束时请长按按钮，避免误触。",
    "run.statusBackgroundOff":
      "Expo Go 只能在当前页面保持激活时记录。若要熄屏继续记录，请使用 iOS development build。",
    "run.failedToStartTracking": "启动定位追踪失败",
    "run.tapToRetry": "点按重试",
    "run.resume": "继续",
    "run.pause": "暂停",
    "run.longPressToFinish": "长按结束",
    "run.endThisRun": "结束本次跑步",
    "summary.loading": "正在生成跑步总结...",
    "summary.notFound": "未找到跑步记录",
    "summary.notFoundBody": "返回首页并开始一次新的跑步。",
    "summary.backHome": "返回首页",
    "summary.eyebrow": "跑步完成",
    "summary.title": "这次跑步已完成。",
    "summary.headerMeta": ({ date, count }) => `${date} · ${count} 个轨迹点`,
    "summary.distance": "距离",
    "summary.duration": "时长",
    "summary.titleCard": "总结",
    "summary.averagePace": "平均配速",
    "summary.finished": "完成时间",
    "summary.totalDistance": "总距离",
    "summary.share": "分享总结",
    "summary.shareMessage": ({ distance, duration, pace }) =>
      `我在 Ruvelo 完成了 ${distance} 的跑步，用时 ${duration}，平均配速 ${pace}。`,
    "map.noRoute": "暂无路线",
    "map.completeRunFirst": "先完成一次跑步，才能查看路线回放。",
    "map.webDisabled": "Web 端暂不显示地图预览",
    "map.webBody": ({ count }) =>
      `这次跑步记录了 ${count} 个轨迹点。请在 Android 或 iOS 上打开以查看完整地图。`,
    "startButton.label": "开始跑步",
    "runCard.duration": "时长",
    "runCard.avgPace": "平均配速",
    "errors.failedToLoadRuns": "加载跑步记录失败",
    "errors.failedToLoadRunDetails": "加载跑步详情失败",
    "errors.failedToStartRun": "开始跑步失败",
    "errors.failedToResumeRun": "继续跑步失败",
    "errors.failedToSaveRun": "保存跑步记录失败",
    "errors.runStartTimeMissing": "缺少跑步开始时间",
    "errors.foregroundPermissionRequired": "开始跑步需要授予前台定位权限",
    "errors.backgroundPermissionRequired": "若要在熄屏后继续记录，需要授予后台定位权限",
    "errors.browserLocationUnsupported": "当前浏览器不支持定位访问",
    "tracking.notificationTitle": "Ruvelo 正在记录你的跑步",
    "tracking.notificationBody": "结束本次跑步后即可查看路线和总结页面。",
  },
} as const satisfies Record<Language, Record<string, TranslationValue>>;

export type TranslationKey = keyof typeof translations.en;

const localeMap: Record<Language, string> = {
  en: "en-US",
  zh: "zh-CN",
};

const distanceUnitMap = {
  en: { km: "km", m: "m" },
  zh: { km: "公里", m: "米" },
} as const;

const paceUnitMap: Record<Language, string> = {
  en: "/km",
  zh: "/公里",
};

export const LANGUAGE_STORAGE_KEY = "ruvelo:language";

function resolveDeviceLanguage(): Language {
  const locale = Intl.DateTimeFormat().resolvedOptions().locale?.toLowerCase() ?? "";
  return locale.startsWith("zh") ? "zh" : "en";
}

let currentLanguage: Language = resolveDeviceLanguage();

export function isLanguage(value: unknown): value is Language {
  return value === "en" || value === "zh";
}

export function getCurrentLanguage() {
  return currentLanguage;
}

export function setCurrentLanguage(language: Language) {
  currentLanguage = language;
}

export function getLocale(language: Language = currentLanguage) {
  return localeMap[language];
}

export function getDistanceUnit(
  language: Language = currentLanguage,
  unit: keyof (typeof distanceUnitMap)["en"] = "km",
) {
  return distanceUnitMap[language][unit];
}

export function getPaceUnit(language: Language = currentLanguage) {
  return paceUnitMap[language];
}

export function translate(language: Language, key: TranslationKey, params: TranslationParams = {}) {
  const value = translations[language][key];
  return typeof value === "function" ? value(params) : value;
}

export function isTranslationKey(value: string): value is TranslationKey {
  return Object.hasOwn(translations.en, value);
}

export function translateText(
  value: string | null | undefined,
  language: Language = currentLanguage,
) {
  if (!value) {
    return "";
  }

  return isTranslationKey(value) ? translate(language, value) : value;
}

export function getErrorTranslationKey(error: unknown, fallback: TranslationKey): TranslationKey {
  if (typeof error === "string" && isTranslationKey(error)) {
    return error;
  }

  if (error instanceof Error && isTranslationKey(error.message)) {
    return error.message;
  }

  return fallback;
}
