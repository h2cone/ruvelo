import { isRunningInExpoGo } from "expo";
import * as Location from "expo-location";

import { getCurrentLanguage, translate } from "../i18n/config";
import { appendLocationObjects, TRACKING_TASK_NAME } from "./tracking";

const foregroundOptions: Location.LocationOptions = {
  accuracy: Location.Accuracy.High,
  distanceInterval: 10,
};

function createBackgroundOptions(): Location.LocationTaskOptions {
  const language = getCurrentLanguage();

  return {
    accuracy: Location.Accuracy.High,
    distanceInterval: 10,
    deferredUpdatesDistance: 10,
    pausesUpdatesAutomatically: false,
    showsBackgroundLocationIndicator: true,
    foregroundService: {
      notificationTitle: translate(language, "tracking.notificationTitle"),
      notificationBody: translate(language, "tracking.notificationBody"),
    },
  };
}

export function supportsBackgroundTracking() {
  return !isRunningInExpoGo();
}

export async function ensureLocationPermissions() {
  const foreground = await Location.requestForegroundPermissionsAsync();
  if (foreground.status !== Location.PermissionStatus.GRANTED) {
    throw new Error("errors.foregroundPermissionRequired");
  }

  if (!supportsBackgroundTracking()) {
    return;
  }

  const background = await Location.requestBackgroundPermissionsAsync();
  if (background.status !== Location.PermissionStatus.GRANTED) {
    throw new Error("errors.backgroundPermissionRequired");
  }
}

export async function beginBackgroundTracking() {
  if (!supportsBackgroundTracking()) {
    return;
  }

  const started = await Location.hasStartedLocationUpdatesAsync(TRACKING_TASK_NAME);
  if (!started) {
    await Location.startLocationUpdatesAsync(TRACKING_TASK_NAME, createBackgroundOptions());
  }
}

export async function endBackgroundTracking() {
  if (!supportsBackgroundTracking()) {
    return;
  }

  const started = await Location.hasStartedLocationUpdatesAsync(TRACKING_TASK_NAME);
  if (started) {
    await Location.stopLocationUpdatesAsync(TRACKING_TASK_NAME);
  }
}

export async function beginForegroundTracking() {
  return Location.watchPositionAsync(foregroundOptions, (location) => {
    appendLocationObjects([location]);
  });
}
