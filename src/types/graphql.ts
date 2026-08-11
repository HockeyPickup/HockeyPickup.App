import {
  BuySellResponse,
  LockerRoom13Response,
  RegularSetDetailedResponse,
  RosterPlayer,
  Session,
  SessionDetailedResponse,
  UserDetailedResponse,
  UserStatsResponse,
} from '@/HockeyPickup.Api';

// GraphQL Query Result Types
export interface UsersQueryResult {
  UsersEx: UserDetailedResponse[];
}

export interface SessionsQueryResult {
  Sessions: Session[];
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
 * The GraphQL `Sessions` list resolves SessionBasicResponse, which carries neither CurrentRosters
 * nor BuySells, so the dashboard reads rosters through aliased `Session(SessionId:)` selections
 * instead. These types are `Pick`ed off the generated Api models so they stay field-for-field with
 * the server, and they deliberately describe only what DASHBOARD_SESSION_FIELDS asks for —
 * ActivityLogs, BuyingQueues, RegularSet and LotteryEntrants are never requested.
 */
export type DashboardCounterparty = Pick<UserDetailedResponse, 'Id' | 'FirstName' | 'LastName'>;

export type DashboardRosterPlayer = Pick<
  RosterPlayer,
  'UserId' | 'FirstName' | 'LastName' | 'TeamAssignment' | 'Position' | 'CurrentPosition' | 'IsPlaying'
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
> & {
  CurrentRosters?: DashboardRosterPlayer[] | null;
  BuySells?: DashboardBuySell[] | null;
};

/** Aliased result: one `s<SessionId>` key per session requested. */
export type DashboardSessionsQueryResult = Record<string, DashboardSession | null>;
