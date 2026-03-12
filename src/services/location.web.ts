import { appendCoordinates } from "./tracking";

interface BrowserLocationSubscription {
  remove: () => void;
}

export function supportsBackgroundTracking() {
  return false;
}

function assertGeolocationAvailable() {
  if (!("geolocation" in navigator)) {
    throw new Error("This browser does not support location access");
  }
}

export async function ensureLocationPermissions() {
  assertGeolocationAvailable();
}

export async function beginBackgroundTracking() {
  return;
}

export async function endBackgroundTracking() {
  return;
}

export async function beginForegroundTracking(): Promise<BrowserLocationSubscription> {
  assertGeolocationAvailable();

  const watchId = navigator.geolocation.watchPosition(
    (position) => {
      appendCoordinates([
        {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          altitude: position.coords.altitude,
          speed: position.coords.speed,
          timestamp: position.timestamp,
        },
      ]);
    },
    (error) => {
      console.error("Browser geolocation error", error);
    },
    {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 10000,
    }
  );

  return {
    remove: () => navigator.geolocation.clearWatch(watchId),
  };
}
