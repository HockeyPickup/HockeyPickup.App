/**
 * FROZEN SNAPSHOT of the production goalie-note parser (`src/lib/goalies.ts`, 2026-10-04).
 *
 * Goalie normalization rewrites `src/lib/goalies.ts` to read goalies from the roster, deleting the
 * note parsing below. The backfill tool still has to read the historical notes exactly the way the
 * site did, so this copy is kept verbatim and must not be "fixed" to diverge from what production
 * displayed. The only change is the user type: a structural `PersonName` instead of the generated
 * Api model, so the tool has no dependency on `src/`.
 */

export interface PersonName {
  FirstName?: string | null;
  LastName?: string | null;
}

export const GOALIE_LABEL = /goalies?\s*:/i;
export const GOALIE_SEGMENT = /goalies?\s*:\s*(.+)$/i;

/** A trailing 1-3 letter word before a period is an abbreviation inside a name — "Darin St. Ivany". */
const TRAILING_ABBREVIATION = /(^|\s)[A-Za-z]{1,3}$/;

/**
 * The goalie list runs from the label to the end of that sentence.
 *
 * The period matters: notes frequently carry a message after the names — "Josh's last pickup
 * skate. Breakfast at Bread & Butter." — and reading to the end of the string swallows it, which
 * previously turned "Bread & Butter" into a goalie called "Butter". Periods that belong to a name
 * are stepped over so "Darin St. Ivany" survives.
 */
export const cutAtSentenceEnd = (segment: string): string => {
  for (let index = 0; index < segment.length; index++) {
    if (segment[index] !== '.') continue;

    const before = segment.slice(0, index);
    if (TRAILING_ABBREVIATION.test(before)) continue;
    return before;
  }
  return segment;
};

/** Drops a sentence-ending period but keeps one that belongs to the name, as in "Ryan Novak Jr.". */
export const stripTrailingPeriod = (name: string): string => {
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

export const normalize = (value: string): string =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
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
export const goalieNameMatchesUser = (noteName: string, user: PersonName): boolean => {
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
