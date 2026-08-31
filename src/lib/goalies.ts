import type { Session, UserDetailedResponse } from '@/HockeyPickup.Api';

/**
 * Goalies are not part of a session roster — they live in the session's free-text `Note`, in the
 * shape "8/10. Goalies: Ryan Novak, Ken Ornstein". Everything here reads that convention.
 *
 * This is deliberately the only module that knows the Note is free text. When goalie assignments
 * are normalised into the schema, this file is what gets deleted; nothing else parses a Note.
 *
 * Two goalies are expected per session. They swap ends at the halfway mark, so a goalie is never
 * "on" Light or Dark and is never the partner of the other — they simply both play.
 */

/** Two nets, two goalies. A session naming fewer than this still needs someone. */
export const GOALIES_PER_SESSION = 2;

const GOALIE_LABEL = /goalies?\s*:/i;
const GOALIE_SEGMENT = /goalies?\s*:\s*(.+)$/i;
const SKATER_COUNT = /(\d+)\s*\/\s*(\d+)/g;

/** A trailing 1-3 letter word before a period is an abbreviation inside a name — "Darin St. Ivany". */
const TRAILING_ABBREVIATION = /(^|\s)[A-Za-z]{1,3}$/;

/** No roster runs to these numbers, so a larger denominator is a date or a year, not a count. */
const MAX_ROSTER_SIZE = 40;

/**
 * The goalie list runs from the label to the end of that sentence.
 *
 * The period matters: notes frequently carry a message after the names — "Josh's last pickup
 * skate. Breakfast at Bread & Butter." — and reading to the end of the string swallows it, which
 * previously turned "Bread & Butter" into a goalie called "Butter". Periods that belong to a name
 * are stepped over so "Darin St. Ivany" survives.
 */
const cutAtSentenceEnd = (segment: string): string => {
  for (let index = 0; index < segment.length; index++) {
    if (segment[index] !== '.') continue;

    const before = segment.slice(0, index);
    if (TRAILING_ABBREVIATION.test(before)) continue;
    return before;
  }
  return segment;
};

/** Drops a sentence-ending period but keeps one that belongs to the name, as in "Ryan Novak Jr.". */
const stripTrailingPeriod = (name: string): string => {
  const trimmed = name.trim();
  if (!trimmed.endsWith('.')) return trimmed;

  const without = trimmed.replace(/\.+$/, '').trim();
  return TRAILING_ABBREVIATION.test(without) ? trimmed : without;
};

/** The goalie names written after the "Goalies:" label, in the order the note lists them. */
export const parseGoalieNames = (note: string | null | undefined): string[] => {
  const match = note?.match(GOALIE_SEGMENT);
  if (!match) return [];

  return cutAtSentenceEnd(match[1])
    .split(/,| and |&/i)
    .map(stripTrailingPeriod)
    .filter((name) => name.length > 0);
};

/**
 * "8/10" — how full the skater roster is.
 *
 * Only the text before the goalie list is considered, since anything after it is prose that may
 * hold a date. Implausible denominators are skipped too: notes like "New pricing effective
 * 10/2022 ... 2/10." would otherwise report a roster of 2022.
 */
export const parseSkaterCount = (
  note: string | null | undefined,
): { filled: number; total: number } | null => {
  if (!note) return null;

  const labelIndex = note.search(GOALIE_LABEL);
  const beforeGoalies = labelIndex === -1 ? note : note.slice(0, labelIndex);

  for (const match of beforeGoalies.matchAll(SKATER_COUNT)) {
    const filled = Number(match[1]);
    const total = Number(match[2]);
    if (total >= 2 && total <= MAX_ROSTER_SIZE && filled <= total) return { filled, total };
  }
  return null;
};

const normalize = (value: string): string =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z\s-]/g, '')
    .trim();

/**
 * Whether a name written in a note refers to this user.
 *
 * Prefix matching on both halves absorbs the drift free text always accumulates: a note reading
 * "Trent Murrell" still resolves to the "Trent Murrell-Meisenheimer" record, and "Ken" to
 * "Kenneth". It is matched against one known person rather than scanned for across the whole
 * note, so an unrelated word in the note cannot produce a false positive.
 */
export const goalieNameMatchesUser = (
  noteName: string,
  user: Pick<UserDetailedResponse, 'FirstName' | 'LastName'>,
): boolean => {
  const parts = normalize(noteName).split(/\s+/).filter(Boolean);
  if (parts.length < 2) return false;

  const noteFirst = parts[0];
  const noteLast = parts.slice(1).join(' ');
  const userFirst = normalize(user.FirstName ?? '');
  const userLast = normalize(user.LastName ?? '');
  if (!userFirst || !userLast) return false;

  const firstMatches = userFirst.startsWith(noteFirst) || noteFirst.startsWith(userFirst);
  const lastMatches = userLast.startsWith(noteLast) || noteLast.startsWith(userLast);
  return firstMatches && lastMatches;
};

export interface GoalieSession {
  session: Session;
  /** Every goalie named on the session, in the order the note lists them. */
  goalieNames: string[];
  /** The names other than the viewer's. */
  otherGoalieNames: string[];
  /** True when the viewer is one of the named goalies. */
  isViewerInNet: boolean;
  /** Nets still unassigned, never negative. */
  openNets: number;
  skaters: { filled: number; total: number } | null;
}

export const describeGoalieSession = (
  session: Session,
  user: Pick<UserDetailedResponse, 'FirstName' | 'LastName'>,
): GoalieSession => {
  const goalieNames = parseGoalieNames(session.Note);
  const isViewerInNet = goalieNames.some((name) => goalieNameMatchesUser(name, user));

  return {
    session,
    goalieNames,
    otherGoalieNames: goalieNames.filter((name) => !goalieNameMatchesUser(name, user)),
    isViewerInNet,
    openNets: Math.max(0, GOALIES_PER_SESSION - goalieNames.length),
    skaters: parseSkaterCount(session.Note),
  };
};
