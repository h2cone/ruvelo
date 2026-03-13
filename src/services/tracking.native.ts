import * as Location from "expo-location";
import * as TaskManager from "expo-task-manager";

import { Coordinate } from "../types/run";
import {
  appendCoordinates as appendCoordinatesStore,
  getRouteBuffer,
  resetRouteBuffer,
  subscribeToRouteBuffer,
  TRACKING_TASK_NAME,
} from "./tracking-store";

function normalizeLocation(location: Location.LocationObject): Coordinate {
  return {
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
    altitude: location.coords.altitude ?? null,
    speed: location.coords.speed ?? null,
    timestamp: location.timestamp,
  };
}

export function appendCoordinates(coordinates: Coordinate[]) {
  appendCoordinatesStore(coordinates);
}

export function appendLocationObjects(locations: Location.LocationObject[]) {
  appendCoordinates(locations.map(normalizeLocation));
}

if (!TaskManager.isTaskDefined(TRACKING_TASK_NAME)) {
  TaskManager.defineTask(TRACKING_TASK_NAME, async ({ data, error }) => {
    if (error) {
      console.error("Background tracking error", error);
      return;
    }

    const locations = (data as { locations?: Location.LocationObject[] } | undefined)?.locations ?? [];
    if (locations.length > 0) {
      appendLocationObjects(locations);
    }
  });
}

export { getRouteBuffer, resetRouteBuffer, subscribeToRouteBuffer, TRACKING_TASK_NAME };
