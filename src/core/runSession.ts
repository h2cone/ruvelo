import { Coordinate, Run } from "../types/run";
import { createRouteStats } from "./route";

export type RunPhase = "idle" | "requesting" | "running" | "paused" | "saving";

export interface RunSessionState {
  phase: RunPhase;
  route: Coordinate[];
  distance: number;
  currentPace: number | null;
  error: string | null;
  startedAt: number | null;
  accumulatedMs: number;
  segmentStartedAt: number | null;
}

export type RunSessionAction =
  | { type: "routeUpdated"; route: Coordinate[] }
  | { type: "startRequested"; now: number }
  | { type: "startSucceeded" }
  | { type: "startFailed"; error: string }
  | { type: "paused"; now: number }
  | { type: "resumeRequested"; now: number }
  | { type: "resumeSucceeded" }
  | { type: "resumeFailed"; error: string }
  | { type: "saveRequested"; now: number }
  | { type: "saveFailed"; error: string }
  | { type: "errorCleared" }
  | { type: "reset" };

function createIdleState(): RunSessionState {
  return {
    phase: "idle",
    route: [],
    distance: 0,
    currentPace: null,
    error: null,
    startedAt: null,
    accumulatedMs: 0,
    segmentStartedAt: null,
  };
}

function accumulateElapsedMs(state: RunSessionState, now: number) {
  if (state.phase !== "running" || !state.segmentStartedAt) {
    return state.accumulatedMs;
  }

  return state.accumulatedMs + (now - state.segmentStartedAt);
}

export function createRunSessionState() {
  return createIdleState();
}

export function reduceRunSession(state: RunSessionState, action: RunSessionAction): RunSessionState {
  switch (action.type) {
    case "routeUpdated": {
      const { distance, currentPace } = createRouteStats(action.route);
      return {
        ...state,
        route: action.route,
        distance,
        currentPace,
      };
    }
    case "startRequested":
      if (state.phase !== "idle") {
        return state;
      }

      return {
        phase: "requesting",
        route: [],
        distance: 0,
        currentPace: null,
        error: null,
        startedAt: action.now,
        accumulatedMs: 0,
        segmentStartedAt: action.now,
      };
    case "startSucceeded":
      if (state.phase !== "requesting") {
        return state;
      }

      return {
        ...state,
        phase: "running",
      };
    case "startFailed":
      return {
        ...createIdleState(),
        error: action.error,
      };
    case "paused":
      if (state.phase !== "running") {
        return state;
      }

      return {
        ...state,
        phase: "paused",
        accumulatedMs: accumulateElapsedMs(state, action.now),
        segmentStartedAt: null,
      };
    case "resumeRequested":
      if (state.phase !== "paused") {
        return state;
      }

      return {
        ...state,
        phase: "requesting",
        error: null,
        segmentStartedAt: action.now,
      };
    case "resumeSucceeded":
      if (state.phase !== "requesting") {
        return state;
      }

      return {
        ...state,
        phase: "running",
      };
    case "resumeFailed":
      return {
        ...state,
        phase: "paused",
        error: action.error,
        segmentStartedAt: null,
      };
    case "saveRequested":
      if (state.phase !== "running" && state.phase !== "paused") {
        return state;
      }

      return {
        ...state,
        phase: "saving",
        accumulatedMs: accumulateElapsedMs(state, action.now),
        segmentStartedAt: null,
      };
    case "saveFailed":
      return {
        ...state,
        phase: "idle",
        error: action.error,
        startedAt: null,
        segmentStartedAt: null,
      };
    case "errorCleared":
      if (!state.error) {
        return state;
      }

      return {
        ...state,
        error: null,
      };
    case "reset":
      return createIdleState();
    default:
      return state;
  }
}

export function getElapsedSeconds(state: RunSessionState, now: number) {
  const elapsedMs = accumulateElapsedMs(state, now);
  return Math.max(0, Math.floor(elapsedMs / 1000));
}

export function createRunRecord(
  state: RunSessionState,
  runId: string,
  endedAt: number,
  route: Coordinate[]
): Run {
  if (!state.startedAt) {
    throw new Error("errors.runStartTimeMissing");
  }

  const { distance } = createRouteStats(route);
  const duration = Math.max(1, Math.floor(state.accumulatedMs / 1000));

  return {
    id: runId,
    startedAt: state.startedAt,
    endedAt,
    duration,
    distance,
    avgPace: distance > 0 ? (duration / distance) * 1000 : 0,
    route,
  };
}
