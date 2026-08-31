import { UserStatsResponse } from '@/HockeyPickup.Api';
import { GET_USERSTATS } from '@/lib/queries';
import { UserStatsQueryResult } from '@/types/graphql';
import type { ErrorLike } from '@apollo/client';
import { useQuery } from '@apollo/client/react';

export interface UserStatsResult {
  stats: UserStatsResponse | undefined;
  loading: boolean;
  error: ErrorLike | undefined;
}

/**
 * Season totals for one player. Shared by the Profile header and the dashboard's Season Snapshot
 * so both read the same query through the same Apollo cache entry.
 */
export const useUserStats = (userId: string | undefined): UserStatsResult => {
  const { data, loading, error } = useQuery<UserStatsQueryResult>(GET_USERSTATS, {
    variables: { UserId: userId },
    skip: !userId,
  });

  return { stats: data?.UserStats, loading, error };
};
