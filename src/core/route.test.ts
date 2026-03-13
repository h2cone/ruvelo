import { describe, expect, it } from "vitest";

import { Coordinate } from "../types/run";
import { haversineDistance } from "../utils/geo";
import { appendCoordinatesToRoute, createRouteStats } from "./route";

function createCoordinate(overrides: Partial<Coordinate> = {}): Coordinate {
  return {
    latitude: 31.2304,
    longitude: 121.4737,
    timestamp: 1000,
    altitude: null,
    speed: null,
    ...overrides,
  };
}

describe("appendCoordinatesToRoute", () => {
  it("appends only non-duplicate coordinates in order", () => {
    const start = createCoordinate();
    const duplicateStart = createCoordinate();
    const checkpoint = createCoordinate({
      latitude: 31.2309,
      longitude: 121.4742,
      timestamp: 2000,
    });
    const finish = createCoordinate({
      latitude: 31.2314,
      longitude: 121.4748,
      timestamp: 3000,
    });

    const route = [start];
    const nextRoute = appendCoordinatesToRoute(route, [duplicateStart, checkpoint, finish]);

    expect(nextRoute).toEqual([start, checkpoint, finish]);
    expect(route).toEqual([start]);
  });

  it("returns the original route reference when every incoming point is a duplicate", () => {
    const start = createCoordinate();
    const route = [start];

    const nextRoute = appendCoordinatesToRoute(route, [createCoordinate()]);

    expect(nextRoute).toBe(route);
  });
});

describe("createRouteStats", () => {
  it("returns zero distance and null pace when the route is too short", () => {
    expect(createRouteStats([])).toEqual({
      distance: 0,
      currentPace: null,
    });

    expect(createRouteStats([createCoordinate()])).toEqual({
      distance: 0,
      currentPace: null,
    });
  });

  it("computes total distance from the whole route and pace from the last segment", () => {
    const start = createCoordinate();
    const middle = createCoordinate({
      latitude: 31.231,
      longitude: 121.474,
      timestamp: 31_000,
    });
    const finish = createCoordinate({
      latitude: 31.2318,
      longitude: 121.4748,
      timestamp: 71_000,
    });

    const stats = createRouteStats([start, middle, finish]);
    const firstSegmentDistance = haversineDistance(start, middle);
    const lastSegmentDistance = haversineDistance(middle, finish);
    const expectedDistance = firstSegmentDistance + lastSegmentDistance;
    const expectedPace = (40 / lastSegmentDistance) * 1000;

    expect(stats.distance).toBeCloseTo(expectedDistance, 6);
    expect(stats.currentPace).toBeCloseTo(expectedPace, 6);
  });

  it("returns null pace when the last segment covers zero distance", () => {
    const start = createCoordinate();
    const stationary = createCoordinate({
      timestamp: 11_000,
    });

    const stats = createRouteStats([start, stationary]);

    expect(stats.distance).toBe(0);
    expect(stats.currentPace).toBeNull();
  });
});
