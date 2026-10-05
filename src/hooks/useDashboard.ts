import { SessionBasicResponse } from '@/HockeyPickup.Api';
import { GET_DASHBOARD } from '@/lib/queries';
import {
  DashboardBuySell,
  DashboardQueryResult,
  DashboardSession,
  GoalieStartsYear,
} from '@/types/graphql';
import type { ErrorLike } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import { useMemo } from 'react';

export interface DashboardResult {
  /** Every upcoming session, soonest first — cancelled ones included, so callers decide. */
  upcomingSessions: SessionBasicResponse[];
  /** Rosters and buy/sell state for the nearest live sessions, soonest first. */
  sessions: DashboardSession[];
  /** The viewer's unsettled transactions — the counterparty names the payment alerts show. */
  pendingPayments: DashboardBuySell[];
  /**
   * Starts already played, by calendar year. Counted server-side from goalie roster rows, because
   * UserStats counts every playing roster row as a game and so cannot tell a start from a skate.
   */
  goalieStartsByYear: Record<number, number>;
  loading: boolean;
  error: ErrorLike | undefined;
  refetch: () => void;
}

const NO_SESSIONS: SessionBasicResponse[] = [];
const NO_DETAIL: DashboardSession[] = [];
const NO_PAYMENTS: DashboardBuySell[] = [];
const NO_STARTS: GoalieStartsYear[] = [];

/**
 * Everything the signed-in player's home page shows, apart from season stats, in one request.
 *
 * The Api's `Dashboard` query works out which sessions matter and returns only the fields the
 * zones read, so there is no list-then-detail waterfall and no session history on the wire.
 */
export const useDashboard = (): DashboardResult => {
  const { data, loading, error, refetch } = useQuery<DashboardQueryResult>(GET_DASHBOARD, {
    fetchPolicy: 'network-only',
  });

  const startsList = data?.Dashboard.GoalieStartsByYear ?? NO_STARTS;
  const goalieStartsByYear = useMemo<Record<number, number>>(
    () => Object.fromEntries(startsList.map(({ Year, Starts }) => [Year, Starts])),
    [startsList],
  );

  return {
    upcomingSessions: data?.Dashboard.UpcomingSessions ?? NO_SESSIONS,
    sessions: data?.Dashboard.Sessions ?? NO_DETAIL,
    pendingPayments: data?.Dashboard.PendingPayments ?? NO_PAYMENTS,
    goalieStartsByYear,
    loading,
    error,
    refetch: () => void refetch(),
  };
};
