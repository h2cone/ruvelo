let initialized = false;

export function getDatabase() {
  return null;
}

export async function initializeDatabase() {
  initialized = true;
}

export function isDatabaseInitialized() {
  return initialized;
}
