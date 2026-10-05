import {
  DashboardResponse,
  DashboardSessionResponse,
  LockerRoom13Response,
  RegularSetDetailedResponse,
  SessionBasicResponse,
  SessionDetailedResponse,
  UserDetailedResponse,
  UserStatsResponse,
} from '@/HockeyPickup.Api';

// GraphQL Query Result Types
export interface UsersQueryResult {
  UsersEx: UserDetailedResponse[];
}

/** The `Sessions` list resolves SessionBasicResponse — goalies included, no roster. */
export interface SessionsQueryResult {
  Sessions: SessionBasicResponse[];
}

export interface SessionQueryResult {
  Session: SessionDetailedResponse;
}

export interface RegularSetsQueryResult {
  RegularSets: RegularSetDetailedResponse[];
}

export interface LockerRoom13QueryResult {
  LockerRoom13: LockerRoom13Response[];
}

export interface UserStatsQueryResult {
  UserStats: UserStatsResponse;
}

/**
 * Dashboard shapes — the Api's lean `Dashboard` models, generated from its Swagger document.
 *
 * GET_DASHBOARD selects every field of these, so they are re-exported as-is. DashboardSession is
 * the exception: the query skips the basic-session fields the zones never read, so it is `Pick`ed
 * down to exactly what is selected.
 *
 * A note on DashboardQueueEntry: the queue position lives only here. `QueuePosition` on
 * BuySellResponse is never populated by the Api's mapper, so the view's `QueueStatus` string —
 * "Next in Line", "In Queue (6)" — is the only way to tell a waiting buyer where they stand.
 */
export type {
  DashboardBuySell,
  DashboardCounterparty,
  DashboardQueueEntry,
  DashboardRosterPlayer,
  GoalieStartsYear,
} from '@/HockeyPickup.Api';

export type DashboardSession = Pick<
  DashboardSessionResponse,
  | 'SessionId'
  | 'SessionDate'
  | 'Note'
  | 'Cost'
  | 'BuyDayMinimum'
  | 'BuyWindow'
  | 'BuyWindowPreferred'
  | 'BuyWindowPreferredPlus'
  | 'Goalies'
  | 'CurrentRosters'
  | 'BuySells'
  | 'BuyingQueues'
>;

export interface DashboardQueryResult {
  Dashboard: Omit<DashboardResponse, 'Sessions'> & { Sessions: DashboardSession[] };
}
