import { useEffect, useState } from "react";

import { getRunById } from "../db/runs";
import { Run } from "../types/run";

export function useRunById(id?: string | string[]) {
  const targetId = Array.isArray(id) ? id[0] : id;
  const [run, setRun] = useState<Run | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadRun() {
      if (!targetId) {
        setLoading(false);
        setRun(null);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const result = await getRunById(targetId);
        if (active) {
          setRun(result);
        }
      } catch (loadError) {
        console.error(loadError);
        if (active) {
          setError("errors.failedToLoadRunDetails");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadRun();

    return () => {
      active = false;
    };
  }, [targetId]);

  return { run, loading, error };
}
