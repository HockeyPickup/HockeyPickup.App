import type { SessionBasicResponse, UserDetailedResponse } from '@/HockeyPickup.Api';
import { Moment } from 'moment-timezone';

/** A goalie on the lounge: everyone with Goalie preference, plus anyone booked in net. */
export interface LoungeGoalie {
  user: UserDetailedResponse;
  /** Upcoming sessions this goalie is in net for, soonest first. */
  upcoming: SessionBasicResponse[];
  /** Sessions already played in net this calendar year. */
  seasonStarts: number;
}

/** Calendar-day key in the Api's naive Pacific frame. */
export const dayKey = (value: Moment): string => value.format('YYYY-MM-DD');

/**
 * Every day shown on a month grid: whole weeks, Sunday first, from the week holding the 1st to the
 * week holding the last day. Five or six rows depending on the month.
 */
export const monthGridDays = (month: Moment): Moment[] => {
  const start = month.clone().startOf('month').startOf('week');
  const end = month.clone().endOf('month').endOf('week');
  const days: Moment[] = [];

  for (const day = start.clone(); !day.isAfter(end, 'day'); day.add(1, 'day')) {
    days.push(day.clone());
  }

  return days;
};
