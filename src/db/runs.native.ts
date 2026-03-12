import { Run, RunRecordRow } from "../types/run";
import { smoothRoute } from "../utils/geo";
import { getDatabase, initializeDatabase } from "./client";

function rowToRun(row: RunRecordRow): Run {
  return {
    id: row.id,
    startedAt: row.started_at,
    endedAt: row.ended_at,
    duration: row.duration,
    distance: row.distance,
    avgPace: row.avg_pace,
    route: JSON.parse(row.route),
  };
}

export async function createRun(run: Run) {
  await initializeDatabase();
  const db = getDatabase();

  await db.runAsync(
    `INSERT INTO runs (id, started_at, ended_at, duration, distance, avg_pace, route)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    run.id,
    run.startedAt,
    run.endedAt,
    run.duration,
    run.distance,
    run.avgPace,
    JSON.stringify(smoothRoute(run.route))
  );

  return run;
}

export async function getRunById(id: string) {
  await initializeDatabase();
  const db = getDatabase();
  const row = await db.getFirstAsync<RunRecordRow>(
    "SELECT * FROM runs WHERE id = ? LIMIT 1",
    id
  );

  return row ? rowToRun(row) : null;
}

export async function getRecentRuns(limit = 20) {
  await initializeDatabase();
  const db = getDatabase();
  const rows = await db.getAllAsync<RunRecordRow>(
    "SELECT * FROM runs ORDER BY started_at DESC LIMIT ?",
    limit
  );

  return rows.map(rowToRun);
}

export async function deleteRun(id: string) {
  await initializeDatabase();
  const db = getDatabase();
  await db.runAsync("DELETE FROM runs WHERE id = ?", id);
}
