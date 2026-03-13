import { appendCoordinatesToRoute } from "../core/route";
import { Coordinate } from "../types/run";

export const TRACKING_TASK_NAME = "ruvelo-background-tracking";

type TrackingListener = (route: Coordinate[]) => void;

const listeners = new Set<TrackingListener>();
let routeBuffer: Coordinate[] = [];

function publishRoute() {
  const snapshot = [...routeBuffer];
  listeners.forEach((listener) => listener(snapshot));
}

export function appendCoordinates(coordinates: Coordinate[]) {
  const nextRoute = appendCoordinatesToRoute(routeBuffer, coordinates);
  if (nextRoute === routeBuffer) {
    return;
  }

  routeBuffer = nextRoute;
  publishRoute();
}

export function resetRouteBuffer() {
  routeBuffer = [];
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
