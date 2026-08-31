import moment, { Moment } from 'moment-timezone';

/**
 * Session times and every window computed from them (BuyWindow, BuyWindowPreferred, ...) are
 * Pacific wall-clock values that the Api serialises with a UTC marker. Parsing them with
 * `moment.utc` therefore yields the correct wall-clock; parsing them locally does not.
 *
 * To compare one against "now", now has to be expressed in the same naive frame — the current
 * Pacific wall-clock, re-parsed as UTC. Comparing against a plain `moment()` reports a future
 * window as already open whenever the browser is not in Pacific.
 */

export const PACIFIC_TIMEZONE = 'America/Los_Angeles';

/** The current Pacific wall-clock, in the same naive UTC frame the Api's dates arrive in. */
export const nowPacific = (): Moment =>
  moment.utc(moment().tz(PACIFIC_TIMEZONE).format('YYYY-MM-DDTHH:mm:ss'));

/** Parses an Api date string as the Pacific wall-clock it actually represents. */
export const sessionMoment = (value: string | null | undefined): Moment => moment.utc(value);

/** True when `value` is at or before `now`. Both must already be in the Pacific frame. */
export const isPastPacific = (value: string | null | undefined, now: Moment): boolean =>
  now.isSameOrAfter(sessionMoment(value));

const MINUTES_PER_HOUR = 60;
const MINUTES_PER_DAY = 24 * MINUTES_PER_HOUR;

/**
 * Coarse countdown, largest two units only: "2d 14h", "14h 22m", "42m".
 * Anything at or past the target reads "Starting now" — a session in progress is not a countdown.
 */
export const formatCountdown = (target: Moment, now: Moment): string => {
  const totalMinutes = Math.floor(target.diff(now, 'minutes'));
  if (totalMinutes <= 0) return 'Starting now';

  const days = Math.floor(totalMinutes / MINUTES_PER_DAY);
  const hours = Math.floor((totalMinutes % MINUTES_PER_DAY) / MINUTES_PER_HOUR);
  const minutes = totalMinutes % MINUTES_PER_HOUR;

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
};
