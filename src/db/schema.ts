export const RUNS_SCHEMA = `
CREATE TABLE IF NOT EXISTS runs (
  id TEXT PRIMARY KEY NOT NULL,
  started_at INTEGER NOT NULL,
  ended_at INTEGER NOT NULL,
  duration INTEGER NOT NULL,
  distance REAL NOT NULL,
  avg_pace REAL NOT NULL,
  route TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS runs_started_at_idx ON runs (started_at DESC);
`;
