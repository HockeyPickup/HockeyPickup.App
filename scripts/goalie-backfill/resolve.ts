import { goalieNameMatchesUser, normalize } from './legacyParser';
import type { DbUser, LegacyGoalie, NameResolution, Overrides } from './model';

const GOALIE_PREFERENCE = 3;

/** Placeholders written where a goalie name would go. "cancelled" guards notes like "Goalies: A, B CANCELLED". */
const PLACEHOLDERS = new Set(['tbd', 'need', 'needed', 'none', 'open', 'sub', 'cancelled', 'canceled']);

/** Nickname → formal first names. Matching is symmetric: "Bill" finds "William" and "William" finds "Bill". */
const NICKNAMES: Record<string, string[]> = {
  ken: ['kenneth'],
  kenny: ['kenneth'],
  josh: ['joshua'],
  mike: ['michael'],
  matt: ['matthew'],
  chris: ['christopher'],
  dave: ['david'],
  jim: ['james'],
  jimmy: ['james'],
  bill: ['william'],
  will: ['william'],
  bob: ['robert'],
  bobby: ['robert'],
  rob: ['robert'],
  tom: ['thomas'],
  dan: ['daniel'],
  danny: ['daniel'],
  nick: ['nicholas'],
  tony: ['anthony'],
  joe: ['joseph'],
  joey: ['joseph'],
  steve: ['steven', 'stephen'],
  alex: ['alexander'],
  ben: ['benjamin'],
  sam: ['samuel'],
  andy: ['andrew'],
  drew: ['andrew'],
  greg: ['gregory'],
  jon: ['jonathan'],
};

/** The key every name is grouped and overridden by: the legacy normalization with whitespace collapsed. */
export const nameKey = (raw: string): string => normalize(raw).replace(/\s+/g, ' ');

const splitKey = (key: string): { first: string; last: string } => {
  const parts = key.split(' ');
  return { first: parts[0] ?? '', last: parts.slice(1).join(' ') };
};

const userKey = (user: DbUser): { first: string; last: string } => ({
  first: nameKey(user.FirstName ?? ''),
  last: nameKey(user.LastName ?? ''),
});

const slug = (value: string): string =>
  nameKey(value)
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

/** D7: deterministic, undeliverable (.invalid TLD) identity for a goalie with no user record. */
export const legacyGoalie = (firstName: string, lastName: string): LegacyGoalie => ({
  FirstName: firstName.trim(),
  LastName: lastName.trim(),
  Email: `legacy.goalie.${slug(firstName)}.${slug(lastName)}@hockeypickup.invalid`,
});

/** First and last name as written in the note, original casing kept. */
const legacyFromRaw = (raw: string): LegacyGoalie => {
  const parts = raw.trim().split(/\s+/);
  return legacyGoalie(parts[0] ?? '', parts.slice(1).join(' '));
};

export const isInvalidName = (raw: string, key: string): boolean => {
  const parts = key.split(' ').filter(Boolean);
  if (parts.length < 2) return true;
  if (raw.includes('?')) return true;
  return parts.some((part) => PLACEHOLDERS.has(part));
};

const expandFirst = (first: string): Set<string> => {
  const forms = new Set([first, ...(NICKNAMES[first] ?? [])]);
  return forms;
};

const nicknameMatches = (key: string, user: DbUser): boolean => {
  const note = splitKey(key);
  const target = userKey(user);
  if (!note.last || !target.first || !target.last) return false;

  const noteForms = expandFirst(note.first);
  const userForms = expandFirst(target.first);
  const firstMatches = [...noteForms].some(
    (form) => userForms.has(form) || [...userForms].some((u) => u.startsWith(form) || form.startsWith(u)),
  );
  const lastMatches = target.last.startsWith(note.last) || note.last.startsWith(target.last);
  return firstMatches && lastMatches;
};

/** Goalie-preference users first, then active, then by last and first name. */
export const sortCandidates = (users: DbUser[]): DbUser[] =>
  [...users].sort((a, b) => {
    const goalie = Number(b.PositionPreference === GOALIE_PREFERENCE) - Number(a.PositionPreference === GOALIE_PREFERENCE);
    if (goalie !== 0) return goalie;
    const active = Number(b.Active) - Number(a.Active);
    if (active !== 0) return active;
    return `${a.LastName ?? ''} ${a.FirstName ?? ''}`.localeCompare(`${b.LastName ?? ''} ${b.FirstName ?? ''}`);
  });

export const normalizeOverrides = (overrides: Overrides): Overrides => ({
  link: Object.fromEntries(Object.entries(overrides.link).map(([name, id]) => [nameKey(name), id])),
  create: Object.fromEntries(Object.entries(overrides.create).map(([name, value]) => [nameKey(name), value])),
  ignore: overrides.ignore.map(nameKey),
  conflicts: overrides.conflicts,
});

/**
 * Resolves one distinct note name to a user, a legacy stub, or a human decision.
 * Tiers run in order: OVERRIDE, INVALID, EXACT, PREFIX, NICKNAME, AMBIGUOUS, NONE.
 * `overrides` must already be normalized.
 */
export const resolveName = (key: string, raw: string, users: DbUser[], overrides: Overrides): NameResolution => {
  const linkId = overrides.link[key];
  if (linkId !== undefined) {
    const user = users.find((candidate) => candidate.Id === linkId);
    if (!user) throw new Error(`overrides.json links "${key}" to unknown AspNetUsers.Id ${linkId}`);
    return { tier: 'OVERRIDE', action: 'LINK', user, candidates: [user] };
  }

  const create = overrides.create[key];
  if (create !== undefined) {
    return { tier: 'OVERRIDE', action: 'CREATE', legacy: legacyGoalie(create.FirstName, create.LastName), candidates: [] };
  }

  if (overrides.ignore.includes(key)) return { tier: 'OVERRIDE', action: 'IGNORE', candidates: [] };

  if (isInvalidName(raw, key)) return { tier: 'INVALID', action: 'IGNORE', candidates: [] };

  const note = splitKey(key);
  const exact = users.filter((user) => {
    const target = userKey(user);
    return target.first === note.first && target.last === note.last;
  });
  if (exact.length === 1) return { tier: 'EXACT', action: 'LINK', user: exact[0], candidates: exact };
  if (exact.length > 1) return { tier: 'AMBIGUOUS', action: 'REVIEW', candidates: sortCandidates(exact) };

  const prefix = users.filter((user) => goalieNameMatchesUser(key, user));
  if (prefix.length === 1) return { tier: 'PREFIX', action: 'LINK', user: prefix[0], candidates: prefix };
  if (prefix.length > 1) return { tier: 'AMBIGUOUS', action: 'REVIEW', candidates: sortCandidates(prefix) };

  const nickname = users.filter((user) => nicknameMatches(key, user));
  if (nickname.length === 1) return { tier: 'NICKNAME', action: 'REVIEW', candidates: nickname };
  if (nickname.length > 1) return { tier: 'AMBIGUOUS', action: 'REVIEW', candidates: sortCandidates(nickname) };

  return { tier: 'NONE', action: 'CREATE', legacy: legacyFromRaw(raw), candidates: [] };
};
