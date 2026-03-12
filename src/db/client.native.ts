import * as SQLite from "expo-sqlite";

import { RUNS_SCHEMA } from "./schema";

const database = SQLite.openDatabaseSync("ruvelo.db");

let initializationPromise: Promise<void> | null = null;

export function getDatabase() {
  return database;
}

export async function initializeDatabase() {
  if (!initializationPromise) {
    initializationPromise = database.execAsync(RUNS_SCHEMA).then(() => undefined);
  }

  return initializationPromise;
}
