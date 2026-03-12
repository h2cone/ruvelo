import * as Location from "expo-location";
import * as TaskManager from "expo-task-manager";

import { Coordinate } from "../types/run";

export const TRACKING_TASK_NAME = "ruvelo-background-tracking";

type TrackingListener = (route: Coordinate[]) => void;

const routeBuffer: Coordinate[] = [];
const listeners = new Set<TrackingListener>();

function normalizeLocation(location: Location.LocationObject): Coordinate {
  return {
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
    altitude: location.coords.altitude ?? null,
    speed: location.coords.speed ?? null,
    timestamp: location.timestamp,
  };
}

function isDuplicateCoordinate(previous: Coordinate | undefined, next: Coordinate) {
  if (!previous) {
    return false;
  }

  return (
    previous.timestamp === next.timestamp &&
    previous.latitude === next.latitude &&
    previous.longitude === next.longitude
  );
}

function publishRoute() {
  const snapshot = [...routeBuffer];
  listeners.forEach((listener) => listener(snapshot));
}

export function appendCoordinates(coordinates: Coordinate[]) {
  coordinates.forEach((coordinate) => {
    const last = routeBuffer[routeBuffer.length - 1];
    if (!isDuplicateCoordinate(last, coordinate)) {
      routeBuffer.push(coordinate);
    }
  });

  publishRoute();
}

export function appendLocationObjects(locations: Location.LocationObject[]) {
  appendCoordinates(locations.map(normalizeLocation));
}

export function resetRouteBuffer() {
  routeBuffer.splice(0, routeBuffer.length);
  publishRoute();
}

export function getRouteBuffer() {
  return [...routeBuffer];
}

export function subscribeToRouteBuffer(listener: TrackingListener) {
  listeners.add(listener);
  listener([...routeBuffer]);

  return () => {
    listeners.delete(listener);
  };
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
