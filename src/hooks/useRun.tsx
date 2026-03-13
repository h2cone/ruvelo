import { router } from "expo-router";
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { LocationSubscription } from "expo-location";

import { createRun } from "../db/runs";
import { getErrorTranslationKey } from "../i18n/config";
import { beginBackgroundTracking, beginForegroundTracking, endBackgroundTracking, ensureLocationPermissions } from "../services/location";
import { getRouteBuffer, resetRouteBuffer, subscribeToRouteBuffer } from "../services/tracking";
import { Coordinate, Run } from "../types/run";
import { totalDistance } from "../utils/geo";

type RunPhase = "idle" | "requesting" | "running" | "paused" | "saving";

interface RunContextValue {
  phase: RunPhase;
  elapsedSeconds: number;
  distance: number;
  currentPace: number | null;
  route: Coordinate[];
  error: string | null;
  isBusy: boolean;
  startRun: () => Promise<void>;
  pauseRun: () => Promise<void>;
  resumeRun: () => Promise<void>;
  finishRun: () => Promise<string | null>;
  clearError: () => void;
}

const RunContext = createContext<RunContextValue | null>(null);

function createRunId() {
  const random = Math.floor(Math.random() * 1_000_000)
    .toString(16)
    .padStart(5, "0");

  return `${Date.now()}-${random}`;
}

export function RunProvider({ children }: PropsWithChildren) {
  const [phase, setPhase] = useState<RunPhase>("idle");
  const [route, setRoute] = useState<Coordinate[]>([]);
  const [distance, setDistance] = useState(0);
  const [currentPace, setCurrentPace] = useState<number | null>(null);
  const [clock, setClock] = useState(Date.now());
  const [error, setError] = useState<string | null>(null);

  const startedAtRef = useRef<number | null>(null);
  const segmentStartedAtRef = useRef<number | null>(null);
  const accumulatedMsRef = useRef(0);
  const watcherRef = useRef<LocationSubscription | null>(null);

  const teardownForegroundTracking = useCallback(async () => {
    await watcherRef.current?.remove();
    watcherRef.current = null;
  }, []);

  const beginCapture = useCallback(async () => {
    watcherRef.current = await beginForegroundTracking();
    await beginBackgroundTracking();
  }, []);

  const stopCapture = useCallback(async () => {
    await teardownForegroundTracking();
    await endBackgroundTracking();
  }, [teardownForegroundTracking]);

  useEffect(() => {
    return subscribeToRouteBuffer((nextRoute) => {
      setRoute(nextRoute);
      const nextDistance = totalDistance(nextRoute);
      setDistance(nextDistance);

      if (nextRoute.length >= 2) {
        const last = nextRoute[nextRoute.length - 1];
        const previous = nextRoute[nextRoute.length - 2];
        const deltaSeconds = Math.max((last.timestamp - previous.timestamp) / 1000, 1);
        const deltaDistance = totalDistance([previous, last]);
        const pace = deltaDistance > 0 ? (deltaSeconds / deltaDistance) * 1000 : null;
        setCurrentPace(pace);
      } else {
        setCurrentPace(null);
      }
    });
  }, []);

  useEffect(() => {
    if (phase !== "running") {
      return;
    }

    const timer = setInterval(() => {
      setClock(Date.now());
    }, 1000);

    return () => clearInterval(timer);
  }, [phase]);

  useEffect(() => {
    return () => {
      teardownForegroundTracking().catch(() => undefined);
      endBackgroundTracking().catch(() => undefined);
    };
  }, [teardownForegroundTracking]);

  const elapsedSeconds = useMemo(() => {
    const segmentMs =
      phase === "running" && segmentStartedAtRef.current
        ? clock - segmentStartedAtRef.current
        : 0;

    return Math.max(0, Math.floor((accumulatedMsRef.current + segmentMs) / 1000));
  }, [clock, phase]);

  const startRun = useCallback(async () => {
    if (phase !== "idle") {
      return;
    }

    try {
      setError(null);
      setPhase("requesting");
      resetRouteBuffer();
      setRoute([]);
      setDistance(0);
      setCurrentPace(null);
      accumulatedMsRef.current = 0;
      startedAtRef.current = Date.now();
      segmentStartedAtRef.current = Date.now();

      await ensureLocationPermissions();
      await beginCapture();

      setClock(Date.now());
      setPhase("running");
    } catch (startError) {
      console.error(startError);
      await stopCapture().catch(() => undefined);
      setPhase("idle");
      setError(getErrorTranslationKey(startError, "errors.failedToStartRun"));
    }
  }, [beginCapture, phase, stopCapture]);

  const pauseRun = useCallback(async () => {
    if (phase !== "running") {
      return;
    }

    const segmentStartedAt = segmentStartedAtRef.current;
    if (segmentStartedAt) {
      accumulatedMsRef.current += Date.now() - segmentStartedAt;
    }
    segmentStartedAtRef.current = null;

    await stopCapture();
    setClock(Date.now());
    setPhase("paused");
  }, [phase, stopCapture]);

  const resumeRun = useCallback(async () => {
    if (phase !== "paused") {
      return;
    }

    try {
      setError(null);
      setPhase("requesting");
      segmentStartedAtRef.current = Date.now();
      await beginCapture();
      setClock(Date.now());
      setPhase("running");
    } catch (resumeError) {
      console.error(resumeError);
      setPhase("paused");
      setError(getErrorTranslationKey(resumeError, "errors.failedToResumeRun"));
    }
  }, [beginCapture, phase]);

  const finishRun = useCallback(async () => {
    if (phase !== "running" && phase !== "paused") {
      return null;
    }

    setPhase("saving");

    try {
      const segmentStartedAt = segmentStartedAtRef.current;
      if (phase === "running" && segmentStartedAt) {
        accumulatedMsRef.current += Date.now() - segmentStartedAt;
      }
      segmentStartedAtRef.current = null;

      await stopCapture();

      const startedAt = startedAtRef.current;
      const endedAt = Date.now();
      const routeSnapshot = getRouteBuffer();
      const duration = Math.max(1, Math.floor(accumulatedMsRef.current / 1000));
      const routeDistance = totalDistance(routeSnapshot);

      if (!startedAt) {
        throw new Error("errors.runStartTimeMissing");
      }

      const run: Run = {
        id: createRunId(),
        startedAt,
        endedAt,
        duration,
        distance: routeDistance,
        avgPace: routeDistance > 0 ? (duration / routeDistance) * 1000 : 0,
        route: routeSnapshot,
      };

      await createRun(run);

      startedAtRef.current = null;
      accumulatedMsRef.current = 0;
      setPhase("idle");
      setClock(Date.now());
      setDistance(0);
      setCurrentPace(null);
      resetRouteBuffer();
      router.replace(`/summary/${run.id}`);

      return run.id;
    } catch (finishError) {
      console.error(finishError);
      setPhase("idle");
      setError(getErrorTranslationKey(finishError, "errors.failedToSaveRun"));
      return null;
    }
  }, [phase, stopCapture]);

  const value = useMemo<RunContextValue>(
    () => ({
      phase,
      elapsedSeconds,
      distance,
      currentPace,
      route,
      error,
      isBusy: phase === "requesting" || phase === "saving",
      startRun,
      pauseRun,
      resumeRun,
      finishRun,
      clearError: () => setError(null),
    }),
    [currentPace, distance, elapsedSeconds, error, finishRun, pauseRun, phase, resumeRun, route, startRun]
  );

  return <RunContext.Provider value={value}>{children}</RunContext.Provider>;
}

export function useRun() {
  const context = useContext(RunContext);

  if (!context) {
    throw new Error("useRun must be used within RunProvider");
  }

  return context;
}
