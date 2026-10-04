/**
 * yarn goalie-backfill:check
 *
 * Offline check of the tool's logic against synthetic data: no database involved. Run it after
 * touching any module here.
 */
import assert from 'node:assert/strict';
import { analyze } from './analyze';
import type { BackfillData, DbSession, DbUser, Overrides } from './model';
import { stripGoalieSegment } from './notes';
import { namesCsv, sessionsCsv, summaryText } from './report';
import { legacyGoalie, nameKey, resolveName } from './resolve';
import { createLegacyGoaliesSql, insertGoalieRostersSql, stripGoalieNotesSql } from './sql';

const EMPTY: Overrides = { link: {}, create: {}, ignore: [], conflicts: {} };

const user = (Id: string, FirstName: string, LastName: string, PositionPreference = 0, Active = true): DbUser => ({
  Id,
  FirstName,
  LastName,
  Email: `${Id}@example.com`,
  PositionPreference,
  Active,
});

const session = (SessionId: number, Note: string | null): DbSession => ({
  SessionId,
  SessionDate: new Date(Date.UTC(2025, 0, SessionId, 7, 30)),
  CreateDateTime: new Date(Date.UTC(2025, 0, 1)),
  Note,
});

// --- Note stripping -------------------------------------------------------------------------
const strips: [string | null, string | null][] = [
  ['8/10. Goalies: Ryan Novak, Ken Ornstein', '8/10.'],
  ['8/10. Goalies: Ryan Novak, Ken Ornstein.', '8/10.'],
  ['8/10 - Goalies: Ryan Novak and Ken Ornstein', '8/10'],
  ["Goalies: Darin St. Ivany, Ryan Novak. Josh's last skate.", "Josh's last skate."],
  ['Goalies: Ryan Novak, Ken Ornstein', null],
  ['8/10. Goalies: Ryan Novak, Ken Ornstein CANCELLED', '8/10. CANCELLED'],
  ['CANCELLED. Goalies: Ryan Novak, Ken Ornstein.', 'CANCELLED.'],
  ['8/10 no goalie listed yet', '8/10 no goalie listed yet'],
  ['Line one\nGoalie: Ryan Novak.\nLine three', 'Line one\nGoalie: Ryan Novak.\nLine three'],
  [null, null],
];
for (const [note, expected] of strips) {
  assert.equal(stripGoalieSegment(note), expected, `strip ${JSON.stringify(note)}`);
}

// --- Name tiers ------------------------------------------------------------------------------
const users: DbUser[] = [
  user('ryan', 'Ryan', 'Novak', 3),
  user('kenneth', 'Kenneth', 'Ornstein', 3),
  user('darin', 'Darin', 'St. Ivany'),
  user('bill', 'William', 'Hart', 3),
  user('mike1', 'Mike', 'Smithers'),
  user('mike2', 'Mikey', 'Smith', 3),
  user('jose', 'José', 'Ruiz', 0, false),
];
const tier = (raw: string, overrides: Overrides = EMPTY): string => {
  const result = resolveName(nameKey(raw), raw, users, overrides);
  return `${result.tier}/${result.action}/${result.user?.Id ?? result.legacy?.Email ?? result.candidates.map((c) => c.Id).join('+')}`;
};
assert.equal(tier('Ryan Novak'), 'EXACT/LINK/ryan');
assert.equal(tier('Ken Ornstein'), 'PREFIX/LINK/kenneth');
assert.equal(tier('Darin St. Ivany'), 'EXACT/LINK/darin');
assert.equal(tier('Jose Ruiz'), 'EXACT/LINK/jose');
assert.equal(tier('Bill Hart'), 'NICKNAME/REVIEW/bill');
assert.equal(tier('Mike Smith'), 'AMBIGUOUS/REVIEW/mike2+mike1');
assert.equal(tier('Joe Schmo'), 'NONE/CREATE/legacy.goalie.joe.schmo@hockeypickup.invalid');
assert.equal(tier('TBD'), 'INVALID/IGNORE/');
assert.equal(tier('Need goalie'), 'INVALID/IGNORE/');
assert.equal(tier('Ryan ?'), 'INVALID/IGNORE/');
assert.equal(tier('Bill Hart', { ...EMPTY, link: { 'bill hart': 'bill' } }), 'OVERRIDE/LINK/bill');
assert.equal(tier('Mike Smith', { ...EMPTY, ignore: ['mike smith'] }), 'OVERRIDE/IGNORE/');
assert.equal(
  tier('Mike Smith', { ...EMPTY, create: { 'mike smith': { FirstName: 'Mike', LastName: "O'Smith" } } }),
  'OVERRIDE/CREATE/legacy.goalie.mike.osmith@hockeypickup.invalid',
);
assert.throws(() => tier('Ryan Novak', { ...EMPTY, link: { 'ryan novak': 'nobody' } }));
assert.equal(legacyGoalie('Jean-Luc', 'Picard Jr.').Email, 'legacy.goalie.jean-luc.picard-jr@hockeypickup.invalid');

// --- Session analysis ------------------------------------------------------------------------
const data: BackfillData = {
  users,
  sessions: [
    session(1, '8/10. Goalies: Ryan Novak, Ken Ornstein'),
    session(2, '9/10. Goalies: Ryan Novak, Ryan Novak'),
    session(3, 'Goalies: Ryan Novak, Ken Ornstein, Joe Schmo, Darin St. Ivany'),
    session(4, 'Goalies:'),
    session(5, 'Goalies: Bill Hart, Ryan Novak'),
    session(6, '10/10 no notes'),
  ],
  rosters: [
    { SessionId: 1, UserId: 'kenneth', Position: 1, TeamAssignment: 1, IsPlaying: true },
    { SessionId: 2, UserId: 'ryan', Position: 3, TeamAssignment: 0, IsPlaying: true },
    { SessionId: 6, UserId: 'mike1', Position: 3, TeamAssignment: 0, IsPlaying: true },
  ],
};

const first = analyze(data, EMPTY);
const byId = (id: number): (typeof first.sessions)[number] => {
  const row = first.sessions.find((candidate) => candidate.session.SessionId === id);
  assert.ok(row, `session ${id}`);
  return row;
};
assert.deepEqual(first.sessions.map((row) => row.session.SessionId), [1, 2, 3, 4, 5]);
assert.deepEqual(byId(1).assignments.map((a) => a.userId), ['ryan']);
assert.equal(byId(1).conflicts[0]?.kind, 'ON_ROSTER_AS_SKATER');
assert.equal(byId(1).conflicts[0]?.resolution, 'skip');
assert.equal(byId(2).conflicts[0]?.kind, 'DUPLICATE_GOALIE');
assert.equal(byId(2).assignments.length, 1);
assert.equal(byId(3).conflicts.find((c) => c.kind === 'OVER_3')?.resolved, false);
assert.equal(byId(3).assignments.find((a) => a.userId === null)?.legacyEmail, 'legacy.goalie.joe.schmo@hockeypickup.invalid');
assert.equal(byId(4).conflicts[0]?.kind, 'UNLABELED');
assert.equal(byId(4).proposedNote, 'Goalies:');
assert.equal(byId(5).hasReview, true);

// Resolve everything and confirm the conversion path
const resolved = analyze(data, {
  link: { 'Bill Hart': 'bill' },
  create: {},
  ignore: [],
  conflicts: { '1:kenneth': 'convert', '3': 'accept', '4': 'accept' },
});
const session1 = resolved.sessions.find((row) => row.session.SessionId === 1);
assert.deepEqual(session1?.conversions.map((c) => c.userId), ['kenneth']);
assert.equal(resolved.sessions.some((row) => row.hasReview), false);
assert.equal(resolved.sessions.flatMap((row) => row.conflicts).every((c) => c.resolved), true);

// Reports and SQL render, and the SQL contains no hard-coded stub GUIDs
const summary = summaryText(data, resolved);
assert.match(summary, /Position = Goalie roster rows not named as goalie in their note: 1/);
assert.match(namesCsv(resolved), /^RawName,Variants,Tier,Action/);
assert.match(sessionsCsv(resolved), /^SessionId,SessionDate,OriginalNote/);
const created = createLegacyGoaliesSql(resolved);
assert.match(created, /N'legacy\.goalie\.joe\.schmo@hockeypickup\.invalid'/);
assert.match(created, /WHERE NOT EXISTS/);
const inserted = insertGoalieRostersSql(resolved);
assert.match(inserted, /\(3, NULL, N'legacy\.goalie\.joe\.schmo@hockeypickup\.invalid', N'Joe Schmo'\)/);
assert.match(inserted, /\(1, N'kenneth', NULL, N'Kenneth Ornstein'\)/);
const stripped = stripGoalieNotesSql(resolved);
assert.match(stripped, /\(1, N'8\/10\. Goalies: Ryan Novak, Ken Ornstein', N'8\/10\.'\)/);
assert.match(stripped, /\(3, N'Goalies: Ryan Novak, Ken Ornstein, Joe Schmo, Darin St\. Ivany', NULL\)/);
assert.doesNotMatch(stripped, /\(4, /);
for (const script of [created, inserted, stripped]) {
  assert.match(script, /BEGIN TRAN;/);
  assert.match(script, /\n-- COMMIT;/);
  assert.doesNotMatch(script, /^\s*COMMIT/m);
}

console.info('goalie-backfill self-check passed');
