import { describe, expect, it } from "vitest";

import type { Coordinate } from "../types/run";
import {
  createRunRecord,
  createRunSessionState,
  getElapsedSeconds,
  type RunSessionState,
  reduceRunSession,
} from "./runSession";

function createCoordinate(overrides: Partial<Coordinate> = {}): Coordinate {
  return {
    latitude: 31.2304,
    longitude: 121.4737,
    timestamp: 1_000,
    altitude: null,
    speed: null,
    ...overrides,
  };
}

function createRunningState(overrides: Partial<RunSessionState> = {}): RunSessionState {
  return {
    phase: "running",
    route: [],
    distance: 0,
    currentPace: null,
    error: null,
    startedAt: 1_000,
    accumulatedMs: 2_000,
    segmentStartedAt: 3_000,
    ...overrides,
  };
}

describe("createRunSessionState", () => {
  it("creates an idle session with clean defaults", () => {
    expect(createRunSessionState()).toEqual({
      phase: "idle",
      route: [],
      distance: 0,
      currentPace: null,
      error: null,
      startedAt: null,
      accumulatedMs: 0,
      segmentStartedAt: null,
    });
  });
});

describe("reduceRunSession", () => {
  it("ignores invalid transitions", () => {
    const idleState = createRunSessionState();
    const nextState = reduceRunSession(idleState, {
      type: "startSucceeded",
    });

    expect(nextState).toBe(idleState);
  });

  it("starts a run by moving to requesting and resetting session data", () => {
    const idleState: RunSessionState = {
      ...createRunSessionState(),
      route: [createCoordinate()],
      distance: 42,
      currentPace: 300,
      error: "old-error",
      accumulatedMs: 9000,
    };

    const nextState = reduceRunSession(idleState, {
      type: "startRequested",
      now: 10_000,
    });

    expect(nextState).toEqual({
      phase: "requesting",
      route: [],
      distance: 0,
      currentPace: null,
      error: null,
      startedAt: 10_000,
      accumulatedMs: 0,
      segmentStartedAt: 10_000,
    });
  });

  it("updates route-derived stats without mutating other session fields", () => {
    const route = [
      createCoordinate(),
      createCoordinate({
        latitude: 31.2309,
        longitude: 121.4742,
        timestamp: 16_000,
      }),
    ];
    const runningState = createRunningState({
      route: [createCoordinate({ latitude: 0, longitude: 0, timestamp: 0 })],
      distance: 1,
      currentPace: 1,
    });

    const nextState = reduceRunSession(runningState, {
      type: "routeUpdated",
      route,
    });

    expect(nextState.route).toBe(route);
    expect(nextState.distance).toBeGreaterThan(0);
    expect(nextState.currentPace).not.toBeNull();
    expect(nextState.phase).toBe("running");
    expect(nextState.startedAt).toBe(runningState.startedAt);
  });

  it("accumulates elapsed time when pausing an active run", () => {
    const runningState = createRunningState({
      accumulatedMs: 2_000,
      segmentStartedAt: 3_000,
    });

    const pausedState = reduceRunSession(runningState, {
      type: "paused",
      now: 8_500,
    });

    expect(pausedState.phase).toBe("paused");
    expect(pausedState.accumulatedMs).toBe(7_500);
    expect(pausedState.segmentStartedAt).toBeNull();
  });

  it("starts resume in requesting mode and clears stale errors", () => {
    const pausedState: RunSessionState = {
      ...createRunningState(),
      phase: "paused",
      error: "resume-error",
      segmentStartedAt: null,
    };

    const nextState = reduceRunSession(pausedState, {
      type: "resumeRequested",
      now: 12_000,
    });

    expect(nextState.phase).toBe("requesting");
    expect(nextState.error).toBeNull();
    expect(nextState.segmentStartedAt).toBe(12_000);
  });

  it("returns to paused when resume fails", () => {
    const requestingState: RunSessionState = {
      ...createRunningState(),
      phase: "requesting",
      segmentStartedAt: 12_000,
    };

    const nextState = reduceRunSession(requestingState, {
      type: "resumeFailed",
      error: "errors.failedToResumeRun",
    });

    expect(nextState.phase).toBe("paused");
    expect(nextState.error).toBe("errors.failedToResumeRun");
    expect(nextState.segmentStartedAt).toBeNull();
  });

  it("moves into saving and finalizes running time", () => {
    const runningState = createRunningState({
      accumulatedMs: 4_000,
      segmentStartedAt: 6_000,
    });

    const nextState = reduceRunSession(runningState, {
      type: "saveRequested",
      now: 15_500,
    });

    expect(nextState.phase).toBe("saving");
    expect(nextState.accumulatedMs).toBe(13_500);
    expect(nextState.segmentStartedAt).toBeNull();
  });

  it("returns to idle and keeps the failure error when save fails", () => {
    const savingState: RunSessionState = {
      ...createRunningState(),
      phase: "saving",
      startedAt: 1_000,
      segmentStartedAt: null,
    };

    const nextState = reduceRunSession(savingState, {
      type: "saveFailed",
      error: "errors.failedToSaveRun",
    });

    expect(nextState.phase).toBe("idle");
    expect(nextState.error).toBe("errors.failedToSaveRun");
    expect(nextState.startedAt).toBeNull();
    expect(nextState.segmentStartedAt).toBeNull();
  });

  it("clears errors without disturbing the rest of the session", () => {
    const erroredState = createRunningState({
      error: "errors.failedToStartRun",
    });

    const nextState = reduceRunSession(erroredState, {
      type: "errorCleared",
    });

    expect(nextState.error).toBeNull();
    expect(nextState.phase).toBe("running");
    expect(nextState.accumulatedMs).toBe(erroredState.accumulatedMs);
  });

  it("resets the entire session back to idle defaults", () => {
    const nextState = reduceRunSession(
      createRunningState({
        route: [createCoordinate()],
        distance: 88,
        currentPace: 240,
        error: "error",
      }),
      {
        type: "reset",
      },
    );

    expect(nextState).toEqual(createRunSessionState());
  });
});

describe("getElapsedSeconds", () => {
  it("includes the active segment while the run is still running", () => {
    const runningState = createRunningState({
      accumulatedMs: 2_500,
      segmentStartedAt: 5_000,
    });

    expect(getElapsedSeconds(runningState, 9_900)).toBe(7);
  });

  it("does not advance once the run is paused", () => {
    const pausedState: RunSessionState = {
      ...createRunningState(),
      phase: "paused",
      accumulatedMs: 8_900,
      segmentStartedAt: null,
    };

    expect(getElapsedSeconds(pausedState, 99_999)).toBe(8);
  });
});

describe("createRunRecord", () => {
  it("throws when the run start time is missing", () => {
    expect(() =>
      createRunRecord(
        {
          ...createRunSessionState(),
          phase: "saving",
          accumulatedMs: 8_000,
        },
        "run-1",
        20_000,
        [],
      ),
    ).toThrow("errors.runStartTimeMissing");
  });

  it("builds a run snapshot with a minimum duration of one second", () => {
    const route = [
      createCoordinate(),
      createCoordinate({
        latitude: 31.231,
        longitude: 121.4741,
        timestamp: 2_000,
      }),
    ];
    const state: RunSessionState = {
      ...createRunSessionState(),
      phase: "saving",
      startedAt: 1_000,
      accumulatedMs: 999,
    };

    const run = createRunRecord(state, "run-1", 2_000, route);

    expect(run).toMatchObject({
      id: "run-1",
      startedAt: 1_000,
      endedAt: 2_000,
      duration: 1,
      route,
    });
    expect(run.distance).toBeGreaterThan(0);
    expect(run.avgPace).toBeGreaterThan(0);
  });

  it("uses the finalized accumulated duration when computing average pace", () => {
    const route = [
      createCoordinate(),
      createCoordinate({
        latitude: 31.231,
        longitude: 121.4741,
        timestamp: 31_000,
      }),
    ];
    const state: RunSessionState = {
      ...createRunSessionState(),
      phase: "saving",
      startedAt: 1_000,
      accumulatedMs: 30_000,
    };

    const run = createRunRecord(state, "run-2", 31_000, route);

    expect(run.duration).toBe(30);
    expect(run.avgPace).toBeCloseTo((run.duration / run.distance) * 1000, 10);
  });
});
