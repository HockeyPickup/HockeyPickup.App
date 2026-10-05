import {
  BuyingQueueItem,
  BuySellResponse,
  LockerRoom13Response,
  RegularSetDetailedResponse,
  RosterPlayer,
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
 * Dashboard shapes.
 *
 * The Api's `Dashboard` query returns lean types (DashboardSession, DashboardBuySell, ...) that
 * carry a subset of the full session models' fields under the same names, so these are `Pick`ed
 * off the generated Api models to stay field-for-field with the server. They describe exactly what
 * GET_DASHBOARD selects — no ActivityLogs, RegularSet or LotteryEntrants, and BuyingQueues trimmed
 * to the scalars that place a buyer in the queue.
 */
export type DashboardCounterparty = Pick<UserDetailedResponse, 'Id' | 'FirstName' | 'LastName'>;

export type DashboardRosterPlayer = Pick<
  RosterPlayer,
  | 'UserId'
  | 'FirstName'
  | 'LastName'
  | 'TeamAssignment'
  | 'Position'
  | 'CurrentPosition'
  | 'IsPlaying'
>;

export type DashboardBuySell = Pick<
  BuySellResponse,
  | 'BuySellId'
  | 'SessionId'
  | 'BuyerUserId'
  | 'SellerUserId'
  | 'PaymentSent'
  | 'PaymentReceived'
  | 'Price'
> & {
  Buyer?: DashboardCounterparty | null;
  Seller?: DashboardCounterparty | null;
};

/**
 * One row of a session's buying queue.
 *
 * The queue position lives only here: `QueuePosition` on BuySellResponse is never populated by
 * the Api's mapper, so the view's `QueueStatus` string — "Next in Line", "In Queue (6)" — is the
 * only way to tell a waiting buyer where they stand.
 */
export type DashboardQueueEntry = Pick<
  BuyingQueueItem,
  'BuySellId' | 'BuyerUserId' | 'SellerUserId' | 'QueueStatus'
>;

export type DashboardSession = Pick<
  SessionDetailedResponse,
  | 'SessionId'
  | 'SessionDate'
  | 'Note'
  | 'Cost'
  | 'BuyDayMinimum'
  | 'BuyWindow'
  | 'BuyWindowPreferred'
  | 'BuyWindowPreferredPlus'
  | 'Goalies'
> & {
  CurrentRosters?: DashboardRosterPlayer[] | null;
  BuySells?: DashboardBuySell[] | null;
  BuyingQueues?: DashboardQueueEntry[] | null;
};

/** Past sessions the viewer played in net, for one calendar year. */
export interface GoalieStartsYear {
  Year: number;
  Starts: number;
}

export interface DashboardQueryResult {
  Dashboard: {
    /** Every upcoming session, soonest first, cancelled ones included. */
    UpcomingSessions: SessionBasicResponse[];
    /** Detail for the nearest live (not cancelled) upcoming sessions, soonest first. */
    Sessions: DashboardSession[];
    /** The viewer's completed transactions still awaiting payment or confirmation. */
    PendingPayments: DashboardBuySell[];
    GoalieStartsByYear: GoalieStartsYear[];
  };
}
