export interface Coordinate {
  latitude: number;
  longitude: number;
  timestamp: number;
  altitude?: number | null;
  speed?: number | null;
}

export interface Run {
  id: string;
  startedAt: number;
  endedAt: number;
  duration: number;
  distance: number;
  avgPace: number;
  route: Coordinate[];
}

export interface RunRecordRow {
  id: string;
  started_at: number;
  ended_at: number;
  duration: number;
  distance: number;
  avg_pace: number;
  route: string;
}
