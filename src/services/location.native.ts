import * as Location from "expo-location";

import { appendLocationObjects, TRACKING_TASK_NAME } from "./tracking";

const backgroundOptions: Location.LocationTaskOptions = {
  accuracy: Location.Accuracy.High,
  distanceInterval: 10,
  deferredUpdatesDistance: 10,
  pausesUpdatesAutomatically: false,
  showsBackgroundLocationIndicator: true,
  foregroundService: {
    notificationTitle: "Ruvelo is tracking your run",
    notificationBody: "Finish the run to see the route and summary screen.",
  },
};

const foregroundOptions: Location.LocationOptions = {
  accuracy: Location.Accuracy.High,
  distanceInterval: 10,
};

export async function ensureLocationPermissions() {
  const foreground = await Location.requestForegroundPermissionsAsync();
  if (foreground.status !== Location.PermissionStatus.GRANTED) {
    throw new Error("Foreground location permission is required to start a run");
  }

  const background = await Location.requestBackgroundPermissionsAsync();
  if (background.status !== Location.PermissionStatus.GRANTED) {
    throw new Error("Background location permission is required to keep tracking with the screen off");
  }
}

export async function beginBackgroundTracking() {
  const started = await Location.hasStartedLocationUpdatesAsync(TRACKING_TASK_NAME);
  if (!started) {
    await Location.startLocationUpdatesAsync(TRACKING_TASK_NAME, backgroundOptions);
  }
}

export async function endBackgroundTracking() {
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
