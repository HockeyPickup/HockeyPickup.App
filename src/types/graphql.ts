import {
  LockerRoom13Response,
  RegularSetDetailedResponse,
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
