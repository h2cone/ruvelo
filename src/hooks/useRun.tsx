import type { LocationSubscription } from "expo-location";
import { router } from "expo-router";
import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  createRunRecord,
  createRunSessionState,
  getElapsedSeconds,
  type RunPhase,
  type RunSessionAction,
  reduceRunSession,
} from "../run/runSession";
import { createRun } from "../db/runs";
import { getErrorTranslationKey } from "../i18n/config";
import {
  beginBackgroundTracking,
  beginForegroundTracking,
  endBackgroundTracking,
  ensureLocationPermissions,
} from "../services/location";
import { getRouteBuffer, resetRouteBuffer, subscribeToRouteBuffer } from "../services/tracking";
import type { Coordinate } from "../types/run";

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
  const [session, setSession] = useState(createRunSessionState);
  const [clock, setClock] = useState(Date.now());
  const sessionRef = useRef(session);

  const watcherRef = useRef<LocationSubscription | null>(null);

  const applySessionAction = useCallback((action: RunSessionAction) => {
    const nextSession = reduceRunSession(sessionRef.current, action);
    sessionRef.current = nextSession;
    setSession(nextSession);

    return nextSession;
  }, []);

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
      applySessionAction({
        type: "routeUpdated",
        route: nextRoute,
      });
    });
  }, [applySessionAction]);

  useEffect(() => {
    if (session.phase !== "running") {
      return;
    }

    const timer = setInterval(() => {
      setClock(Date.now());
    }, 1000);

    return () => clearInterval(timer);
  }, [session.phase]);

  useEffect(() => {
    return () => {
      teardownForegroundTracking().catch(() => undefined);
      endBackgroundTracking().catch(() => undefined);
    };
  }, [teardownForegroundTracking]);

  const elapsedSeconds = getElapsedSeconds(session, clock);

  const startRun = useCallback(async () => {
    if (sessionRef.current.phase !== "idle") {
      return;
    }

    try {
      const now = Date.now();
      applySessionAction({
        type: "startRequested",
        now,
      });
      resetRouteBuffer();
      await ensureLocationPermissions();
      await beginCapture();

      setClock(Date.now());
      applySessionAction({
        type: "startSucceeded",
      });
    } catch (startError) {
      console.error(startError);
      await stopCapture().catch(() => undefined);
      applySessionAction({
        type: "startFailed",
        error: getErrorTranslationKey(startError, "errors.failedToStartRun"),
      });
    }
  }, [applySessionAction, beginCapture, stopCapture]);

  const pauseRun = useCallback(async () => {
    if (sessionRef.current.phase !== "running") {
      return;
    }

    const now = Date.now();
    applySessionAction({
      type: "paused",
      now,
    });
    await stopCapture();
    setClock(now);
  }, [applySessionAction, stopCapture]);

  const resumeRun = useCallback(async () => {
    if (sessionRef.current.phase !== "paused") {
      return;
    }

    try {
      applySessionAction({
        type: "resumeRequested",
        now: Date.now(),
      });
      await beginCapture();
      setClock(Date.now());
      applySessionAction({
        type: "resumeSucceeded",
      });
    } catch (resumeError) {
      console.error(resumeError);
      applySessionAction({
        type: "resumeFailed",
        error: getErrorTranslationKey(resumeError, "errors.failedToResumeRun"),
      });
    }
  }, [applySessionAction, beginCapture]);

  const finishRun = useCallback(async () => {
    const currentSession = sessionRef.current;
    if (currentSession.phase !== "running" && currentSession.phase !== "paused") {
      return null;
    }

    try {
      const endedAt = Date.now();
      const savingSession = applySessionAction({
        type: "saveRequested",
        now: endedAt,
      });

      await stopCapture();

      const routeSnapshot = getRouteBuffer();
      const run = createRunRecord(savingSession, createRunId(), endedAt, routeSnapshot);
      await createRun(run);

      applySessionAction({
        type: "reset",
      });
      setClock(Date.now());
      resetRouteBuffer();
      router.replace(`/summary/${run.id}`);

      return run.id;
    } catch (finishError) {
      console.error(finishError);
      applySessionAction({
        type: "saveFailed",
        error: getErrorTranslationKey(finishError, "errors.failedToSaveRun"),
      });
      return null;
    }
  }, [applySessionAction, stopCapture]);

  const value: RunContextValue = {
    phase: session.phase,
    elapsedSeconds,
    distance: session.distance,
    currentPace: session.currentPace,
    route: session.route,
    error: session.error,
    isBusy: session.phase === "requesting" || session.phase === "saving",
    startRun,
    pauseRun,
    resumeRun,
    finishRun,
    clearError: () => {
      applySessionAction({
        type: "errorCleared",
      });
    },
  };

  return <RunContext.Provider value={value}>{children}</RunContext.Provider>;
}

export function useRun() {
  const context = useContext(RunContext);

  if (!context) {
    throw new Error("useRun must be used within RunProvider");
  }

  return context;
}
