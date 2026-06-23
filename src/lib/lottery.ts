import { LotteryClass, LotteryEntrantResponse } from '@/HockeyPickup.Api';

export const LOTTERY_CLASS_LABELS: Record<LotteryClass, string> = {
  [LotteryClass.PreferredPlus]: 'Preferred Plus',
  [LotteryClass.Preferred]: 'Preferred',
  [LotteryClass.Standard]: 'Standard',
};

// Draws happen tier-by-tier in this order.
const CLASS_ORDER: LotteryClass[] = [
  LotteryClass.PreferredPlus,
  LotteryClass.Preferred,
  LotteryClass.Standard,
];

export interface DrawnClass {
  lotteryClass: LotteryClass;
  entrants: LotteryEntrantResponse[]; // ordered by DrawOrder
  drawDateTime: string | null;
}

// A tier is "drawn" once any of its entrants has a DrawOrder assigned. Returns one entry per
// drawn tier, entrants ordered by pick number.
export const getDrawnClasses = (
  entrants: LotteryEntrantResponse[] | null | undefined,
): DrawnClass[] => {
  if (!entrants) return [];
  return CLASS_ORDER.map((lotteryClass): DrawnClass => {
    const drawn = entrants
      .filter((e) => e.LotteryClass === lotteryClass && e.DrawOrder !== null && e.DrawOrder !== undefined)
      .sort((a, b) => (a.DrawOrder ?? 0) - (b.DrawOrder ?? 0));
    return {
      lotteryClass,
      entrants: drawn,
      drawDateTime: drawn.find((e) => e.DrawDateTime)?.DrawDateTime ?? null,
    };
  }).filter((c) => c.entrants.length > 0);
};

// Per-user, per-draw "already revealed" key. Includes DrawDateTime so a re-draw replays.
export const revealStorageKey = (
  sessionId: number,
  lotteryClass: LotteryClass,
  drawDateTime: string | null,
): string => `lotteryReveal:${sessionId}:${lotteryClass}:${drawDateTime ?? 'unknown'}`;

// Fisher-Yates shuffle returning a new array (used for the reveal's shuffle frames).
export const shuffle = <T>(items: T[]): T[] => {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};
