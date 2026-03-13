import type { Coordinate } from "../types/run";
import {
  appendCoordinates as appendCoordinatesStore,
  getRouteBuffer,
  resetRouteBuffer,
  subscribeToRouteBuffer,
  TRACKING_TASK_NAME,
} from "./tracking-store";

export function appendCoordinates(coordinates: Coordinate[]) {
  appendCoordinatesStore(coordinates);
}

export { getRouteBuffer, resetRouteBuffer, subscribeToRouteBuffer, TRACKING_TASK_NAME };
