import { Coordinate } from "../types/run";

export const TRACKING_TASK_NAME = "ruvelo-background-tracking";

type TrackingListener = (route: Coordinate[]) => void;

const routeBuffer: Coordinate[] = [];
const listeners = new Set<TrackingListener>();

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
