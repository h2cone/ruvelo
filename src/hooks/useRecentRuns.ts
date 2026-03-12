import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";

import { getRecentRuns } from "../db/runs";
import { Run } from "../types/run";

export function useRecentRuns(limit = 12) {
  const [runs, setRuns] = useState<Run[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRuns = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      const result = await getRecentRuns(limit);
      setRuns(result);
    } catch (loadError) {
      console.error(loadError);
      setError("Failed to load runs");
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useFocusEffect(
    useCallback(() => {
      loadRuns();
    }, [loadRuns])
  );

  return { runs, loading, error, reload: loadRuns };
}
