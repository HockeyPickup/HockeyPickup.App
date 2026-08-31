import { formatCountdown, nowPacific, sessionMoment } from '@/lib/pacificTime';
import { useEffect, useState } from 'react';

const TICK_MS = 30_000;

/**
 * A live "2d 14h" countdown to a Pacific wall-clock target.
 *
 * Ticks every 30s: the display only resolves to minutes, so a per-second timer would re-render the
 * spotlight card ~60x for nothing, and a per-minute one can leave the last minute visibly stale.
 */
export const useCountdown = (target: string | null | undefined): string => {
  const [label, setLabel] = useState<string>(() => formatCountdown(sessionMoment(target), nowPacific()));

  useEffect(() => {
    const update = (): void => setLabel(formatCountdown(sessionMoment(target), nowPacific()));

    update();
    const timer = window.setInterval(update, TICK_MS);
    return (): void => window.clearInterval(timer);
  }, [target]);

  return label;
};
