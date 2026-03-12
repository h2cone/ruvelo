import { Run } from "../types/run";
import { smoothRoute } from "../utils/geo";

const STORAGE_KEY = "ruvelo:runs";

function readRuns() {
  const raw = globalThis.localStorage?.getItem(STORAGE_KEY);
  if (!raw) {
    return [] as Run[];
  }

  try {
    return JSON.parse(raw) as Run[];
  } catch (error) {
    console.error("Failed to parse runs from localStorage", error);
    return [] as Run[];
  }
}

function writeRuns(runs: Run[]) {
  globalThis.localStorage?.setItem(STORAGE_KEY, JSON.stringify(runs));
}

export async function createRun(run: Run) {
  const runs = readRuns();
  const nextRun: Run = {
    ...run,
    route: smoothRoute(run.route),
  };

  writeRuns([nextRun, ...runs]);
  return nextRun;
}

export async function getRunById(id: string) {
  return readRuns().find((run) => run.id === id) ?? null;
}

export async function getRecentRuns(limit = 20) {
  return readRuns()
    .sort((a, b) => b.startedAt - a.startedAt)
    .slice(0, limit);
}

export async function deleteRun(id: string) {
  const runs = readRuns().filter((run) => run.id !== id);
  writeRuns(runs);
}
