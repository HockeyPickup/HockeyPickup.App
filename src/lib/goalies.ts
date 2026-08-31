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

const GOALIE_SEGMENT = /goalies?\s*:\s*(.+)$/i;
const SKATER_COUNT = /(\d+)\s*\/\s*(\d+)/;

/**
 * Names appear last in the note, comma separated. Anything after the label is treated as the
 * name list, so a trailing sentence would be absorbed — acceptable because every session written
 * to date ends on the goalie list, and the alternative (splitting on periods) would break the
 * "St." and "Jr." names that do occur in this club.
 */
export const parseGoalieNames = (note: string | null | undefined): string[] => {
  const match = note?.match(GOALIE_SEGMENT);
  if (!match) return [];

  return match[1]
    .split(/,| and |&/i)
    .map((name) => name.trim().replace(/\.+$/, '').trim())
    .filter((name) => name.length > 0);
};

/** "8/10" from the front of a note, for showing how full the skater roster is. */
export const parseSkaterCount = (
  note: string | null | undefined,
): { filled: number; total: number } | null => {
  const match = note?.match(SKATER_COUNT);
  if (!match) return null;

  const filled = Number(match[1]);
  const total = Number(match[2]);
  return Number.isFinite(filled) && Number.isFinite(total) ? { filled, total } : null;
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
