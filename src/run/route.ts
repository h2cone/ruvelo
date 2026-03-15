import type { Coordinate } from "../types/run";
import { haversineDistance, totalDistance } from "../utils/geo";

export interface RouteStats {
  distance: number;
  currentPace: number | null;
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

export function appendCoordinatesToRoute(route: Coordinate[], coordinates: Coordinate[]) {
  const nextRoute = [...route];
  let hasChanges = false;

  coordinates.forEach((coordinate) => {
    const last = nextRoute[nextRoute.length - 1];
    if (!isDuplicateCoordinate(last, coordinate)) {
      nextRoute.push(coordinate);
      hasChanges = true;
    }
  });

  return hasChanges ? nextRoute : route;
}

export function createRouteStats(route: Coordinate[]): RouteStats {
  const distance = totalDistance(route);

  if (route.length < 2) {
    return {
      distance,
      currentPace: null,
    };
  }

  const last = route[route.length - 1];
  const previous = route[route.length - 2];
  const deltaSeconds = Math.max((last.timestamp - previous.timestamp) / 1000, 1);
  const deltaDistance = haversineDistance(previous, last);

  return {
    distance,
    currentPace: deltaDistance > 0 ? (deltaSeconds / deltaDistance) * 1000 : null,
  };
}
