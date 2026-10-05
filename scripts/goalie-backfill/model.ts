/** Rows read from the database (read-only). */
export interface DbSession {
  SessionId: number;
  SessionDate: Date;
  CreateDateTime: Date;
  Note: string | null;
}

export interface DbUser {
  Id: string;
  FirstName: string | null;
  LastName: string | null;
  Email: string | null;
  PositionPreference: number;
  Active: boolean;
}

export interface DbRosterRow {
  SessionId: number;
  UserId: string;
  Position: number;
  TeamAssignment: number;
  IsPlaying: boolean;
}

export interface BackfillData {
  sessions: DbSession[];
  users: DbUser[];
  rosters: DbRosterRow[];
}

export type Tier = 'OVERRIDE' | 'EXACT' | 'PREFIX' | 'NICKNAME' | 'AMBIGUOUS' | 'NONE' | 'INVALID';
export type Action = 'LINK' | 'CREATE' | 'IGNORE' | 'REVIEW';

/** A goalie that does not exist as a user yet; created as a D7 legacy stub. */
export interface LegacyGoalie {
  FirstName: string;
  LastName: string;
  Email: string;
}

export interface NameResolution {
  tier: Tier;
  action: Action;
  /** Set when action is LINK. */
  user?: DbUser;
  /** Set when action is CREATE. */
  legacy?: LegacyGoalie;
  candidates: DbUser[];
}

export type ConflictKind = 'ON_ROSTER_AS_SKATER' | 'DUPLICATE_GOALIE' | 'OVER_3' | 'UNLABELED';

export interface Conflict {
  kind: ConflictKind;
  /** Override key that resolves it; null when the conflict is informational only. */
  key: string | null;
  detail: string;
  resolved: boolean;
  /** ON_ROSTER_AS_SKATER only: what to do with the existing row. */
  resolution?: ConflictResolution;
}

export type ConflictResolution = 'skip' | 'convert' | 'accept';

/** One goalie the backfill will put on one session. */
export interface GoalieAssignment {
  sessionId: number;
  /** Existing user id, or null for a legacy stub (resolved by email in SQL). */
  userId: string | null;
  legacyEmail: string | null;
  displayName: string;
}

export interface NameRow {
  key: string;
  /** The spelling used most often; also what a NONE name's legacy stub is named from. */
  raw: string;
  variants: Set<string>;
  resolution: NameResolution;
  sessionIds: number[];
  firstSeen: Date;
  lastSeen: Date;
}

export interface SessionRow {
  session: DbSession;
  parsedNames: string[];
  assignments: GoalieAssignment[];
  /** Existing skater rows turned into goalie rows (conflict override "convert"). */
  conversions: GoalieAssignment[];
  conflicts: Conflict[];
  /** '' when nothing remains of the note (never NULL; see stripGoalieSegment). */
  proposedNote: string | null;
  /** True when any parsed name still needs a human decision. */
  hasReview: boolean;
}

export interface Overrides {
  link: Record<string, string>;
  create: Record<string, { FirstName: string; LastName: string }>;
  ignore: string[];
  conflicts: Record<string, ConflictResolution>;
}

export interface Analysis {
  names: NameRow[];
  sessions: SessionRow[];
}
