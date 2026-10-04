import { cutAtSentenceEnd, GOALIE_SEGMENT } from './legacyParser';

const CANCELLED_WORDS = /\b[\w-]*cancell?ed\b/gi;

/** Separators left dangling once the goalie segment is gone: "8/10 -", "8/10,", ", Breakfast after". */
const LEADING_STRAY = /^[\s,;:.\-–—]+/;
const TRAILING_STRAY = /[\s,;:\-–—]+$/;

/** Same rule as the front end's isCancelled() and CalendarService: any "cancelled" anywhere in the note. */
export const isCancelledNote = (note: string | null): boolean => note?.toLowerCase().includes('cancelled') ?? false;

const tidy = (text: string): string =>
  text
    .split('\n')
    .map((line) => line.replace(/[ \t]+/g, ' ').trim())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(LEADING_STRAY, '')
    .replace(TRAILING_STRAY, '');

/**
 * The note with its goalie segment removed: from the label to the end of that sentence (as the
 * legacy parser defines it), including the terminating period, or to the end of the line when the
 * sentence never ends. Returns null when nothing is left.
 *
 * Only a segment the legacy parser actually reads is removed: a label it cannot read (a bare
 * "Goalies:", or names followed by more lines) is left in place, because its names never reach the
 * roster and stripping it would lose them. Those sessions surface as UNLABELED for a human.
 *
 * "cancelled" is never removed: if the cut segment carried it, the word is kept in the note so the
 * session still reads as cancelled everywhere.
 */
export const stripGoalieSegment = (note: string | null): string | null => {
  if (note === null) return null;

  const match = GOALIE_SEGMENT.exec(note);
  if (!match) return note;

  const start = match.index;
  const namesStart = start + match[0].length - match[1].length;
  const kept = cutAtSentenceEnd(match[1]);
  const hasSentenceEnd = kept.length < match[1].length;
  const end = hasSentenceEnd ? namesStart + kept.length + 1 : start + match[0].length;

  const removed = note.slice(start, end);
  const keptCancelled = removed.match(CANCELLED_WORDS) ?? [];
  const parts = [note.slice(0, start), ...keptCancelled, note.slice(end)];

  const proposed = tidy(parts.join(' '));
  if (isCancelledNote(note) && !isCancelledNote(proposed)) {
    throw new Error(`Stripping would change the cancelled state of note: ${note}`);
  }
  return proposed.length > 0 ? proposed : null;
};
