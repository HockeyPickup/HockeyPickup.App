import { buildDashboardSessionsQuery, dashboardSessionAlias } from '@/lib/queries';
import { DashboardSession, DashboardSessionsQueryResult } from '@/types/graphql';
import type { ErrorLike } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import { useMemo } from 'react';

export interface DashboardSessionsResult {
  /** Same order as the ids passed in; sessions the server did not return are dropped. */
  sessions: DashboardSession[];
  loading: boolean;
  error: ErrorLike | undefined;
  refetch: () => void;
}

/**
 * Stage two of the dashboard fetch: rosters and buy/sell state for a known set of sessions,
 * in one request.
 *
 * The document is rebuilt whenever the id set changes and memoised on it, so Apollo sees a stable
 * document across renders — a fresh DocumentNode every render would defeat its cache entirely.
 */
export const useDashboardSessions = (sessionIds: number[]): DashboardSessionsResult => {
  const idKey = sessionIds.join(',');

  const query = useMemo(() => buildDashboardSessionsQuery(sessionIds), [idKey]);

  const { data, loading, error, refetch } = useQuery<DashboardSessionsQueryResult>(query, {
    skip: sessionIds.length === 0,
    fetchPolicy: 'network-only',
  });

  const sessions = useMemo<DashboardSession[]>(() => {
    if (!data) return [];
    return sessionIds
      .map((sessionId) => data[dashboardSessionAlias(sessionId)])
      .filter((session): session is DashboardSession => Boolean(session));
  }, [data, idKey]);

  return { sessions, loading, error, refetch: () => void refetch() };
};
