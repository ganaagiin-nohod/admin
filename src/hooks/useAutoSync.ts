import { useEffect, useRef } from 'react';
import { toast } from 'sonner';

interface UseAutoSyncOptions {
  enabled: boolean;
  intervalMinutes?: number;
  onSync?: () => void;
}

export function useAutoSync({
  enabled,
  intervalMinutes = 30,
  onSync
}: UseAutoSyncOptions) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastSyncRef = useRef<number>(0);

  const performSync = async () => {
    try {
      const response = await fetch('/api/jobs/sync-emails', {
        method: 'POST'
      });

      if (response.ok) {
        const data = await response.json();
        if (data.emailsProcessed > 0) {
          toast.success(
            `Auto-sync: Found ${data.emailsProcessed} emails, updated ${data.jobsUpdated} jobs`
          );
          onSync?.();
        }
        lastSyncRef.current = Date.now();
      }
    } catch (error) {
      console.error('Auto-sync failed:', error);
    }
  };

  useEffect(() => {
    if (!enabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    const now = Date.now();
    const timeSinceLastSync = now - lastSyncRef.current;
    const intervalMs = intervalMinutes * 60 * 1000;

    if (timeSinceLastSync >= intervalMs) {
      setTimeout(performSync, 5000);
    }

    intervalRef.current = setInterval(performSync, intervalMs);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enabled, intervalMinutes]);

  return {
    performSync,
    lastSync: lastSyncRef.current
  };
}
