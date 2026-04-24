'use client';

import { useEffect, useState } from 'react';

/**
 * Returns seconds since `from`, ticking every `intervalMs`. Avoids re-rendering
 * once an order leaves the active queue.
 */
export function useElapsedSeconds(from: string | Date | null, intervalMs = 5_000): number {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!from) return;
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [from, intervalMs]);

  if (!from) return 0;
  const start = typeof from === 'string' ? new Date(from).getTime() : from.getTime();
  return Math.max(0, Math.floor((now - start) / 1000));
}

export function formatElapsed(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m < 60) return s ? `${m}m ${s}s` : `${m}m`;
  const h = Math.floor(m / 60);
  const rm = m % 60;
  return rm ? `${h}h ${rm}m` : `${h}h`;
}
