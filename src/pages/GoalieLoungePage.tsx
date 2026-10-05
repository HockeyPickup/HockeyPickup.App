import { GoalieAvatar } from '@/components/GoalieAvatar';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import {
  PositionPreference,
  SessionBasicResponse,
  SessionGoalie,
  UserDetailedResponse,
} from '@/HockeyPickup.Api';
import { useTitle } from '@/layouts/TitleContext';
import { isCancelled } from '@/lib/dashboard';
import { GOALIES_PER_SESSION, getSessionGoalies, goalieName, isUserInNet } from '@/lib/goalies';
import { nowPacific, sessionMoment } from '@/lib/pacificTime';
import { GET_SESSIONS, GET_USERS } from '@/lib/queries';
import { SessionsQueryResult, UsersQueryResult } from '@/types/graphql';
import { useQuery } from '@apollo/client/react';
import {
  Badge,
  Card,
  Container,
  Group,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { IconCalendar, IconUserQuestion } from '@tabler/icons-react';
import { JSX, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';

interface GoalieCardData {
  user: UserDetailedResponse;
  upcoming: SessionBasicResponse[];
  seasonStarts: number;
}

const asPerson = (user: UserDetailedResponse): Pick<SessionGoalie, 'FirstName' | 'LastName' | 'PhotoUrl'> => ({
  FirstName: user.FirstName ?? '',
  LastName: user.LastName ?? '',
  PhotoUrl: user.PhotoUrl,
});

const GoalieSlot = ({ goalie }: { goalie: SessionGoalie }): JSX.Element => (
  <Link to={`/profile/${goalie.UserId}`} style={{ textDecoration: 'none', color: 'inherit' }}>
    <Group gap='xs' wrap='nowrap'>
      <GoalieAvatar goalie={goalie} size={32} />
      <Text size='sm' fw={500}>
        {goalieName(goalie)}
      </Text>
    </Group>
  </Link>
);

const OpenNet = (): JSX.Element => (
  <Badge color='orange' variant='light' radius='sm' leftSection={<IconUserQuestion size={12} />}>
    Open net
  </Badge>
);

/** One row per upcoming session — all of them: who is in net, or which net is still open. */
const UpcomingNets = ({ sessions }: { sessions: SessionBasicResponse[] }): JSX.Element => (
  <Paper shadow='sm' p='md'>
    <Title order={3} mb='md'>
      Upcoming Nets
    </Title>
    {sessions.length === 0 ? (
      <Text c='dimmed'>No upcoming sessions.</Text>
    ) : (
      <Stack gap='xs'>
        {sessions.map((session) => {
          const goalies = getSessionGoalies(session);
          const open = Math.max(0, GOALIES_PER_SESSION - goalies.length);
          const when = sessionMoment(session.SessionDate);

          return (
            <Card key={session.SessionId} radius='md' p='sm' withBorder bg='dark.6'>
              <Group justify='space-between' wrap='wrap' gap='sm'>
                <Link
                  to={`/session/${session.SessionId}`}
                  style={{ textDecoration: 'none', color: 'inherit', minWidth: 150 }}
                >
                  <Group gap='xs' wrap='nowrap'>
                    <IconCalendar size={18} style={{ color: '#909296' }} />
                    <Text size='sm' fw={600}>
                      {when.format('ddd, MMM D')}
                    </Text>
                    <Text size='sm' c='dimmed'>
                      {when.format('h:mmA')}
                    </Text>
                  </Group>
                </Link>
                <Group gap='lg' wrap='wrap'>
                  {goalies.map((goalie) => (
                    <GoalieSlot key={goalie.UserId} goalie={goalie} />
                  ))}
                  {Array.from({ length: open }, (_, index) => (
                    <OpenNet key={`open-${index}`} />
                  ))}
                </Group>
              </Group>
            </Card>
          );
        })}
      </Stack>
    )}
  </Paper>
);

const GoalieCard = ({ user, upcoming, seasonStarts }: GoalieCardData): JSX.Element => {
  const next = upcoming[0];

  return (
    <Card
      component={Link}
      to={`/profile/${user.Id}`}
      radius='md'
      p='md'
      withBorder
      bg='dark.6'
      style={{ textDecoration: 'none', color: 'inherit', height: '100%' }}
    >
      <Group gap='md' wrap='nowrap' align='flex-start'>
        <GoalieAvatar goalie={asPerson(user)} size={64} />
        <Stack gap={4} style={{ minWidth: 0 }}>
          <Text fw={700} size='lg' style={{ lineHeight: 1.2 }}>
            {user.FirstName} {user.LastName}
            {user.JerseyNumber !== 0 && (
              <Text component='span' c='dimmed' fw={500} ml={6}>
                #{user.JerseyNumber}
              </Text>
            )}
          </Text>
          <Text size='sm' c='dimmed'>
            {next
              ? `Next start: ${sessionMoment(next.SessionDate).format('ddd, MMM D')}`
              : 'No upcoming starts'}
          </Text>
          <Group gap='xs' mt={4}>
            <Badge size='sm' radius='sm' variant='light' color='teal'>
              {upcoming.length} upcoming
            </Badge>
            <Badge size='sm' radius='sm' variant='light' color='gray'>
              {seasonStarts} {seasonStarts === 1 ? 'start' : 'starts'} in {nowPacific().year()}
            </Badge>
          </Group>
        </Stack>
      </Group>
    </Card>
  );
};

export const GoalieLoungePage = (): JSX.Element => {
  const { setPageInfo } = useTitle();
  const { loading, error, data } = useQuery<UsersQueryResult>(GET_USERS);
  const {
    loading: sessionsLoading,
    error: sessionsError,
    data: sessionsData,
  } = useQuery<SessionsQueryResult>(GET_SESSIONS);

  useEffect(() => {
    setPageInfo('Goalie Lounge');
  }, [setPageInfo]);

  const { board, cards } = useMemo(() => {
    const now = nowPacific();
    const sessions = (sessionsData?.Sessions ?? []).filter(
      (session) => Boolean(session.SessionDate) && !isCancelled(session),
    );
    const bySoonest = (a: SessionBasicResponse, b: SessionBasicResponse): number =>
      sessionMoment(a.SessionDate).valueOf() - sessionMoment(b.SessionDate).valueOf();

    const upcoming = sessions
      .filter((session) => sessionMoment(session.SessionDate).isAfter(now))
      .sort(bySoonest);
    const thisSeasonPlayed = sessions.filter((session) => {
      const when = sessionMoment(session.SessionDate);
      return !when.isAfter(now) && when.year() === now.year();
    });

    // Goalie-preference users, plus anyone else booked in net: any player can be a goalie.
    const cardData: GoalieCardData[] = (data?.UsersEx ?? [])
      .map((user) => ({
        user,
        upcoming: upcoming.filter((session) => isUserInNet(session, user.Id)),
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

    return {
      board: upcoming,
      cards: cardData,
    };
  }, [data, sessionsData]);

  if (loading || sessionsLoading) return <LoadingSpinner />;
  if (error) return <Text c='red'>Error: {error.message}</Text>;
  if (sessionsError) return <Text c='red'>Error: {sessionsError.message}</Text>;

  return (
    <Container size='xl' mb='lg'>
      <Stack gap='lg'>
        <UpcomingNets sessions={board} />
        <Paper shadow='sm' p='md'>
          <Title order={3} mb='md'>
            Goalies ({cards.length})
          </Title>
          <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing='md'>
            {cards.map((card) => (
              <GoalieCard key={card.user.Id} {...card} />
            ))}
          </SimpleGrid>
        </Paper>
      </Stack>
    </Container>
  );
};
