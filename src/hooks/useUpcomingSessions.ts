import { Session } from '@/HockeyPickup.Api';
import { GET_SESSIONS } from '@/lib/queries';
import { nowPacific, sessionMoment } from '@/lib/pacificTime';
import { SessionsQueryResult } from '@/types/graphql';
import { useQuery } from '@apollo/client/react';
import type { ErrorLike } from '@apollo/client';
import { useMemo } from 'react';

export interface UpcomingSessionsResult {
  sessions: Session[];
  loading: boolean;
  error: ErrorLike | undefined;
}

/**
 * Future sessions, soonest first, from the cheap basic list.
 *
 * This is stage one of the dashboard's fetch: it exists to learn *which* sessions matter, because
 * the list query cannot carry rosters. useDashboardSessions then fills in the detail.
 */
export const useUpcomingSessions = (): UpcomingSessionsResult => {
  const { data, loading, error } = useQuery<SessionsQueryResult>(GET_SESSIONS, {
    fetchPolicy: 'network-only',
  });

  const sessions = useMemo<Session[]>(() => {
    if (!data?.Sessions) return [];
    const now = nowPacific();

    return [...data.Sessions]
      .filter((session: Session) => Boolean(session.SessionDate) && sessionMoment(session.SessionDate).isAfter(now))
      .sort(
        (a: Session, b: Session) =>
          sessionMoment(a.SessionDate).valueOf() - sessionMoment(b.SessionDate).valueOf(),
      );
  }, [data]);

  return { sessions, loading, error };
};
