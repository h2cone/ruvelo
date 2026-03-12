import { Coordinate } from "../types/run";

const EARTH_RADIUS = 6371000;

function toRadians(degrees: number) {
  return (degrees * Math.PI) / 180;
}

export function haversineDistance(a: Coordinate, b: Coordinate) {
  const latDelta = toRadians(b.latitude - a.latitude);
  const lonDelta = toRadians(b.longitude - a.longitude);
  const lat1 = toRadians(a.latitude);
  const lat2 = toRadians(b.latitude);

  const haversine =
    Math.sin(latDelta / 2) * Math.sin(latDelta / 2) +
    Math.cos(lat1) *
      Math.cos(lat2) *
      Math.sin(lonDelta / 2) *
      Math.sin(lonDelta / 2);

  return 2 * EARTH_RADIUS * Math.asin(Math.sqrt(haversine));
}

export function sanitizeCoordinate(point: Coordinate) {
  return {
    latitude: Number(point.latitude),
    longitude: Number(point.longitude),
    timestamp: Number(point.timestamp),
    altitude: point.altitude ?? null,
    speed: point.speed ?? null,
  };
}

export function smoothRoute(route: Coordinate[]) {
  if (route.length < 3) {
    return route.map(sanitizeCoordinate);
  }

  return route.map((point, index, array) => {
    if (index === 0 || index === array.length - 1) {
      return sanitizeCoordinate(point);
    }

    const prev = array[index - 1];
    const next = array[index + 1];

    return sanitizeCoordinate({
      ...point,
      latitude: (prev.latitude + point.latitude + next.latitude) / 3,
      longitude: (prev.longitude + point.longitude + next.longitude) / 3,
    });
  });
}

export function totalDistance(route: Coordinate[]) {
  if (route.length < 2) {
    return 0;
  }

  return route.reduce((distance, point, index) => {
    if (index === 0) {
      return 0;
    }

    return distance + haversineDistance(route[index - 1], point);
  }, 0);
}

export function boundingRegion(route: Coordinate[]) {
  if (route.length === 0) {
    return null;
  }

  const latitudes = route.map((point) => point.latitude);
  const longitudes = route.map((point) => point.longitude);
  const minLat = Math.min(...latitudes);
  const maxLat = Math.max(...latitudes);
  const minLng = Math.min(...longitudes);
  const maxLng = Math.max(...longitudes);

  return {
    latitude: (minLat + maxLat) / 2,
    longitude: (minLng + maxLng) / 2,
    latitudeDelta: Math.max((maxLat - minLat) * 1.6, 0.01),
    longitudeDelta: Math.max((maxLng - minLng) * 1.6, 0.01),
  };
}
