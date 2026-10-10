import { LoadingSpinner } from '@/components/LoadingSpinner';
import { GoalieCards } from '@/components/lounge/GoalieCards';
import { NetsCalendar } from '@/components/lounge/NetsCalendar';
import { UpNextCard } from '@/components/lounge/UpNextCard';
import { PositionPreference, SessionBasicResponse } from '@/HockeyPickup.Api';
import { useTitle } from '@/layouts/TitleContext';
import { useAuth } from '@/lib/auth';
import { isCancelled } from '@/lib/dashboard';
import { isUserInNet } from '@/lib/goalies';
import { LoungeGoalie } from '@/lib/lounge';
import { nowPacific, sessionMoment } from '@/lib/pacificTime';
import { GET_SESSIONS, GET_USERS } from '@/lib/queries';
import { SessionsQueryResult, UsersQueryResult } from '@/types/graphql';
import { useQuery } from '@apollo/client/react';
import { Container, Stack, Text } from '@mantine/core';
import { JSX, useEffect, useMemo } from 'react';

/**
 * Goalie Lounge: the next skate up front, then the goalies themselves face-first, then a month
 * calendar of who is in which net.
 */
export const GoalieLoungePage = (): JSX.Element => {
  const { setPageInfo } = useTitle();
  const { user: viewer } = useAuth();
  const { loading, error, data } = useQuery<UsersQueryResult>(GET_USERS);
  const {
    loading: sessionsLoading,
    error: sessionsError,
    data: sessionsData,
  } = useQuery<SessionsQueryResult>(GET_SESSIONS);

  useEffect(() => {
    setPageInfo('Goalie Lounge');
  }, [setPageInfo]);

  const { dated, upcoming, goalies } = useMemo(() => {
    const now = nowPacific();
    const withDates = (sessionsData?.Sessions ?? []).filter((session) => Boolean(session.SessionDate));
    const sessions = withDates.filter((session) => !isCancelled(session));
    const bySoonest = (a: SessionBasicResponse, b: SessionBasicResponse): number =>
      sessionMoment(a.SessionDate).valueOf() - sessionMoment(b.SessionDate).valueOf();

    const ahead = sessions
      .filter((session) => sessionMoment(session.SessionDate).isAfter(now))
      .sort(bySoonest);
    const thisSeasonPlayed = sessions.filter((session) => {
      const when = sessionMoment(session.SessionDate);
      return !when.isAfter(now) && when.year() === now.year();
    });

    // Goalie-preference users, plus anyone else booked in net: any player can be a goalie.
    const lounge: LoungeGoalie[] = (data?.UsersEx ?? [])
      .map((user) => ({
        user,
        upcoming: ahead.filter((session) => isUserInNet(session, user.Id)),
        seasonStarts: thisSeasonPlayed.filter((session) => isUserInNet(session, user.Id)).length,
      }))
      .filter(
        ({ user, upcoming: starts }) =>
          user.Active && (user.PositionPreference === PositionPreference.Goalie || starts.length > 0),
      )
      .sort(
        (a, b) =>
          b.upcoming.length - a.upcoming.length ||
          b.seasonStarts - a.seasonStarts ||
          (a.user.LastName ?? '').localeCompare(b.user.LastName ?? ''),
      );

    return { dated: withDates, upcoming: ahead, goalies: lounge };
  }, [data, sessionsData]);

  if (loading || sessionsLoading) return <LoadingSpinner />;
  if (error) return <Text c='red'>Error: {error.message}</Text>;
  if (sessionsError) return <Text c='red'>Error: {sessionsError.message}</Text>;

  return (
    <Container size='xl' mb='lg'>
      <Stack gap='lg'>
        <UpNextCard upcoming={upcoming} viewerId={viewer?.Id} />
        <GoalieCards goalies={goalies} viewerId={viewer?.Id} />
        <NetsCalendar sessions={dated} goalies={goalies} viewerId={viewer?.Id} />
      </Stack>
    </Container>
  );
};
