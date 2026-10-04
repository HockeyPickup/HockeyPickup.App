import { unexplainedGoalieRows } from './analyze';
import type { Analysis, BackfillData, Conflict, DbUser, NameRow, SessionRow } from './model';

const POSITIONS = ['TBD', 'Forward', 'Defense', 'Goalie'];

const csvCell = (value: string | number | boolean | null): string => {
  const text = value === null ? '' : String(value);
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

const toCsv = (header: string[], rows: (string | number | boolean | null)[][]): string =>
  [header, ...rows].map((row) => row.map(csvCell).join(',')).join('\r\n') + '\r\n';

/** Stored SessionDate wall-clock value (Pacific); the driver hands datetime columns back as UTC instants. */
const formatDate = (date: Date): string => date.toISOString().slice(0, 16).replace('T', ' ');

const fullName = (user: DbUser): string => `${user.FirstName ?? ''} ${user.LastName ?? ''}`.trim();

const describeCandidate = (user: DbUser): string =>
  `${fullName(user)} [${user.Id}] pref=${POSITIONS[user.PositionPreference] ?? user.PositionPreference} active=${user.Active ? 1 : 0}`;

const describeConflict = (conflict: Conflict): string =>
  `${conflict.kind}${conflict.key ? `[${conflict.key}=${conflict.resolution ?? 'unresolved'}]` : ''}: ${conflict.detail}`;

export const namesCsv = (analysis: Analysis): string =>
  toCsv(
    [
      'RawName',
      'Variants',
      'Tier',
      'Action',
      'MatchedUserId',
      'MatchedName',
      'MatchedPositionPref',
      'MatchedActive',
      'CandidateCount',
      'Candidates',
      'SessionCount',
      'FirstSeen',
      'LastSeen',
      'SampleSessionIds',
    ],
    [...analysis.names]
      .sort((a, b) => a.resolution.tier.localeCompare(b.resolution.tier) || a.key.localeCompare(b.key))
      .map((row) => {
        const { resolution } = row;
        const matchedName = resolution.user
          ? fullName(resolution.user)
          : resolution.legacy
            ? `${resolution.legacy.FirstName} ${resolution.legacy.LastName} (new legacy stub ${resolution.legacy.Email})`
            : null;
        return [
          row.raw,
          [...row.variants].join(' | '),
          resolution.tier,
          resolution.action,
          resolution.user?.Id ?? null,
          matchedName,
          resolution.user ? (POSITIONS[resolution.user.PositionPreference] ?? null) : null,
          resolution.user ? resolution.user.Active : null,
          resolution.candidates.length,
          resolution.candidates.map(describeCandidate).join(' | '),
          row.sessionIds.length,
          formatDate(row.firstSeen),
          formatDate(row.lastSeen),
          row.sessionIds.slice(0, 5).join(' '),
        ];
      }),
  );

const resolvedIds = (row: SessionRow): string =>
  [...row.assignments, ...row.conversions]
    .map((assignment) => assignment.userId ?? `new:${assignment.legacyEmail ?? ''}`)
    .join(' ');

export const sessionsCsv = (analysis: Analysis): string =>
  toCsv(
    ['SessionId', 'SessionDate', 'OriginalNote', 'ParsedNames', 'ResolvedUserIds', 'GoalieCount', 'Conflicts', 'ProposedNote'],
    analysis.sessions.map((row) => [
      row.session.SessionId,
      formatDate(row.session.SessionDate),
      row.session.Note,
      row.parsedNames.join('; '),
      `${resolvedIds(row)}${row.hasReview ? ' REVIEW-PENDING' : ''}`.trim(),
      row.assignments.length + row.conversions.length,
      row.conflicts.map(describeConflict).join(' | '),
      row.proposedNote ?? 'NULL',
    ]),
  );

const countBy = <T>(items: T[], keyOf: (_item: T) => string): string[] => {
  const counts = new Map<string, number>();
  for (const item of items) counts.set(keyOf(item), (counts.get(keyOf(item)) ?? 0) + 1);
  return [...counts.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([key, count]) => `  ${key.padEnd(28)} ${count}`);
};

export const reviewNames = (analysis: Analysis): NameRow[] =>
  analysis.names.filter((row) => row.resolution.action === 'REVIEW');

export const unresolvedConflicts = (analysis: Analysis): { row: SessionRow; conflict: Conflict }[] =>
  analysis.sessions.flatMap((row) => row.conflicts.filter((conflict) => !conflict.resolved).map((conflict) => ({ row, conflict })));

export const summaryText = (data: BackfillData, analysis: Analysis): string => {
  const conflicts = analysis.sessions.flatMap((row) => row.conflicts);
  const legacy = new Set(
    analysis.names.flatMap((row) => (row.resolution.action === 'CREATE' && row.resolution.legacy ? [row.resolution.legacy.Email] : [])),
  );
  const leak = unexplainedGoalieRows(data, analysis);
  const review = reviewNames(analysis);
  const unresolved = unresolvedConflicts(analysis);

  return [
    `Goalie backfill preview — ${new Date().toISOString()}`,
    '',
    `Sessions read:                         ${data.sessions.length}`,
    `Users read:                            ${data.users.length}`,
    `Sessions mentioning a goalie:          ${analysis.sessions.length}`,
    `Sessions whose note would change:      ${analysis.sessions.filter((row) => row.proposedNote !== row.session.Note).length}`,
    `Goalie rows to insert:                 ${analysis.sessions.reduce((sum, row) => sum + row.assignments.length, 0)}`,
    `Skater rows to convert to goalie:      ${analysis.sessions.reduce((sum, row) => sum + row.conversions.length, 0)}`,
    `Legacy goalie stubs to create:         ${legacy.size}`,
    `Distinct names:                        ${analysis.names.length}`,
    '',
    'Names by tier:',
    ...countBy(analysis.names, (row) => row.resolution.tier),
    '',
    'Names by action:',
    ...countBy(analysis.names, (row) => row.resolution.action),
    '',
    'Conflicts:',
    ...countBy(conflicts, (conflict) => `${conflict.kind}${conflict.resolved ? '' : ' (unresolved)'}`),
    '',
    `Position = Goalie roster rows not named as goalie in their note: ${leak.length}`,
    '  (the §2 BuySell/trigger leak — these will display as goalies once the front end reads the roster)',
    '',
    `REVIEW names remaining:                ${review.length}`,
    ...review.map((row) => `  ${[...row.variants].join(' | ')} — ${row.resolution.tier}, ${row.resolution.candidates.length} candidate(s)`),
    `Unresolved conflicts remaining:        ${unresolved.length}`,
    ...unresolved.map(({ row, conflict }) => `  session ${row.session.SessionId}: ${describeConflict(conflict)}`),
    '',
  ].join('\n');
};
