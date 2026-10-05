import { parseGoalieNames } from './legacyParser';
import type {
  Analysis,
  BackfillData,
  Conflict,
  DbRosterRow,
  GoalieAssignment,
  NameRow,
  Overrides,
  SessionRow,
} from './model';
import { stripGoalieSegment } from './notes';
import { nameKey, normalizeOverrides, resolveName } from './resolve';

const GOALIE_POSITION = 3;
const MAX_GOALIES = 3;
const MENTIONS_GOALIE = /goalie/i;

const POSITIONS = ['TBD', 'Forward', 'Defense', 'Goalie'];
const TEAMS = ['TBD', 'Light', 'Dark'];

const describeRow = (row: DbRosterRow): string =>
  `${POSITIONS[row.Position] ?? row.Position}/${TEAMS[row.TeamAssignment] ?? row.TeamAssignment}/${row.IsPlaying ? 'playing' : 'not playing'}`;

/** The spelling a name was written with most often; ties go to the first one seen. */
const mostCommon = (counts: Map<string, number>): string =>
  [...counts.entries()].reduce((best, entry) => (entry[1] > best[1] ? entry : best))[0];

export const analyze = (data: BackfillData, rawOverrides: Overrides): Analysis => {
  const overrides = normalizeOverrides(rawOverrides);
  const goalieSessions = data.sessions
    .filter((session) => session.Note !== null && MENTIONS_GOALIE.test(session.Note))
    .sort((a, b) => a.SessionDate.getTime() - b.SessionDate.getTime());

  // Group every parsed name by its normalized key
  const spellings = new Map<string, Map<string, number>>();
  const nameRows = new Map<string, Omit<NameRow, 'resolution' | 'raw'>>();
  for (const session of goalieSessions) {
    for (const raw of parseGoalieNames(session.Note)) {
      const key = nameKey(raw);
      const counts = spellings.get(key) ?? new Map<string, number>();
      counts.set(raw, (counts.get(raw) ?? 0) + 1);
      spellings.set(key, counts);

      const row = nameRows.get(key) ?? {
        key,
        variants: new Set<string>(),
        sessionIds: [],
        firstSeen: session.SessionDate,
        lastSeen: session.SessionDate,
      };
      row.variants.add(raw);
      if (!row.sessionIds.includes(session.SessionId)) row.sessionIds.push(session.SessionId);
      row.lastSeen = session.SessionDate;
      nameRows.set(key, row);
    }
  }

  const names: NameRow[] = [...nameRows.values()].map((row) => {
    const raw = mostCommon(spellings.get(row.key) ?? new Map([[row.key, 1]]));
    return { ...row, raw, resolution: resolveName(row.key, raw, data.users, overrides) };
  });
  const byKey = new Map(names.map((row) => [row.key, row]));

  const rostersBySession = new Map<number, DbRosterRow[]>();
  for (const row of data.rosters) {
    rostersBySession.set(row.SessionId, [...(rostersBySession.get(row.SessionId) ?? []), row]);
  }

  const sessions: SessionRow[] = goalieSessions.map((session) => {
    const parsedNames = parseGoalieNames(session.Note);
    const roster = rostersBySession.get(session.SessionId) ?? [];
    const assignments: GoalieAssignment[] = [];
    const conversions: GoalieAssignment[] = [];
    const conflicts: Conflict[] = [];
    let hasReview = false;
    const seen = new Set<string>();

    for (const raw of parsedNames) {
      const resolution = byKey.get(nameKey(raw))?.resolution;
      if (!resolution || resolution.action === 'IGNORE') continue;
      if (resolution.action === 'REVIEW') {
        hasReview = true;
        continue;
      }

      const assignment: GoalieAssignment = {
        sessionId: session.SessionId,
        userId: resolution.user?.Id ?? null,
        legacyEmail: resolution.legacy?.Email ?? null,
        displayName: resolution.user
          ? `${resolution.user.FirstName ?? ''} ${resolution.user.LastName ?? ''}`.trim()
          : `${resolution.legacy?.FirstName ?? ''} ${resolution.legacy?.LastName ?? ''}`.trim(),
      };

      const identity = assignment.userId ?? assignment.legacyEmail ?? '';
      if (seen.has(identity)) {
        conflicts.push({ kind: 'DUPLICATE_GOALIE', key: null, detail: `${assignment.displayName} listed twice`, resolved: true });
        continue;
      }
      seen.add(identity);

      const existing = assignment.userId ? roster.find((row) => row.UserId === assignment.userId) : undefined;
      if (existing && existing.Position !== GOALIE_POSITION) {
        const key = `${session.SessionId}:${existing.UserId}`;
        const resolutionChoice = overrides.conflicts[key] === 'convert' ? 'convert' : 'skip';
        conflicts.push({
          kind: 'ON_ROSTER_AS_SKATER',
          key,
          detail: `${assignment.displayName} is on the roster as ${describeRow(existing)}`,
          resolved: true,
          resolution: resolutionChoice,
        });
        if (resolutionChoice === 'convert') conversions.push(assignment);
        continue;
      }

      // An existing Position = Goalie row is already the goalie; the insert's NOT EXISTS guard makes it a no-op
      assignments.push(assignment);
    }

    const goalieCount = assignments.length + conversions.length;
    if (goalieCount > MAX_GOALIES) {
      const key = `${session.SessionId}`;
      conflicts.push({
        kind: 'OVER_3',
        key,
        detail: `${goalieCount} goalies`,
        resolved: overrides.conflicts[key] === 'accept',
        resolution: overrides.conflicts[key],
      });
    }

    if (parsedNames.length === 0) {
      const key = `${session.SessionId}`;
      conflicts.push({
        kind: 'UNLABELED',
        key,
        detail: 'mentions a goalie but the parser found no names',
        resolved: overrides.conflicts[key] === 'accept',
        resolution: overrides.conflicts[key],
      });
    }

    return {
      session,
      parsedNames,
      assignments,
      conversions,
      conflicts,
      proposedNote: stripGoalieSegment(session.Note),
      hasReview,
    };
  });

  return { names, sessions };
};

/** Position = Goalie roster rows whose session note does not name that user as a goalie (the §2 BuySell leak). */
export const unexplainedGoalieRows = (data: BackfillData, analysis: Analysis): DbRosterRow[] => {
  const named = new Set(
    analysis.sessions.flatMap((row) =>
      [...row.assignments, ...row.conversions].map((assignment) => `${assignment.sessionId}:${assignment.userId}`),
    ),
  );
  return data.rosters.filter((row) => row.Position === GOALIE_POSITION && !named.has(`${row.SessionId}:${row.UserId}`));
};
