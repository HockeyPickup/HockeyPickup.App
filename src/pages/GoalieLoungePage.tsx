import { LoadingSpinner } from '@/components/LoadingSpinner';
import { PositionPreference, Session, User } from '@/HockeyPickup.Api';
import { useTitle } from '@/layouts/TitleContext';
import { GET_SESSIONS, GET_USERS } from '@/lib/queries';
import { useQuery } from '@apollo/client';
import { Avatar, Container, Paper, Table, Text } from '@mantine/core';
import moment from 'moment';
import { JSX, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AvatarService } from '../services/avatar';

const UpcomingGames = ({
  goalie,
  sessions,
}: {
  goalie: User;
  sessions: Session[];
}): JSX.Element => {
  const goalieFirstThree = (goalie.FirstName ?? '').slice(0, 3).toLowerCase();
  const goalieLastThree = (goalie.LastName ?? '').slice(0, 3).toLowerCase();
  const upcomingSessions = sessions
    .filter(
      (session) =>
        session.SessionDate &&
        moment(session.SessionDate.replace('Z', '')).isAfter(moment()) &&
        session.Note?.toLowerCase().includes(goalieFirstThree) &&
        session.Note?.toLowerCase().includes(goalieLastThree),
    )
    .sort((a: Session, b: Session) => {
      if (!a.SessionDate || !b.SessionDate) return 0;
      const dateA = moment(a.SessionDate.replace('Z', ''));
      const dateB = moment(b.SessionDate.replace('Z', ''));
      return dateA.valueOf() - dateB.valueOf();
    });

  return (
    <>
      <Text size='sm' fw={500} ta='center'>
        {upcomingSessions.length} Upcoming {upcomingSessions.length === 1 ? 'Game' : 'Games'}
      </Text>
      {upcomingSessions.length > 0 && (
        <Table striped highlightOnHover>
          <Table.Tbody>
            {upcomingSessions.map((session) => (
              <Table.Tr key={session.SessionId}>
                <Table.Td style={{ textAlign: 'center' }}>
                  <Link
                    to={`/session/${session.SessionId}`}
                    style={{ textDecoration: 'none', color: 'inherit' }}
                  >
                    {moment.utc(session.SessionDate).format('dddd, MM/DD/yyyy, HH:mm')}
                  </Link>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      )}
    </>
  );
};

const GoalieTableComponent = ({
  goalies,
  avatars,
  sessions,
}: {
  goalies: User[];
  avatars: Record<string, string>;
  sessions: Session[];
}): JSX.Element => {
  // Sort goalies by number of upcoming games
  const sortedGoalies = [...goalies].sort((a, b) => {
    const aFirstThree = (a.FirstName ?? '').slice(0, 3).toLowerCase();
    const aLastThree = (a.LastName ?? '').slice(0, 3).toLowerCase();
    const bFirstThree = (b.FirstName ?? '').slice(0, 3).toLowerCase();
    const bLastThree = (b.LastName ?? '').slice(0, 3).toLowerCase();

    const aGames = sessions.filter(
      (session) =>
        session.SessionDate &&
        moment(session.SessionDate.replace('Z', '')).isAfter(moment()) &&
        session.Note?.toLowerCase().includes(aFirstThree) &&
        session.Note?.toLowerCase().includes(aLastThree),
    ).length;

    const bGames = sessions.filter(
      (session) =>
        session.SessionDate &&
        moment(session.SessionDate.replace('Z', '')).isAfter(moment()) &&
        session.Note?.toLowerCase().includes(bFirstThree) &&
        session.Note?.toLowerCase().includes(bLastThree),
    ).length;

    return bGames - aGames; // Sort descending
  });
  return (
    <Table striped mb='xl'>
      <Table.Tbody>
        {Array.from({ length: Math.ceil(goalies.length / 2) }, (_, rowIndex) => (
          <Table.Tr key={rowIndex}>
            {sortedGoalies.slice(rowIndex * 2, rowIndex * 2 + 2).map((goalie: User) => (
              <Table.Td key={goalie.Id} style={{ width: '50%', verticalAlign: 'top' }}>
                <Link
                  to={`/profile/${goalie.Id}`}
                  style={{
                    textDecoration: 'none',
                    color: 'inherit',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.5rem',
                      alignItems: 'center', // This centers the children horizontally
                    }}
                  >
                    <Avatar
                      src={avatars[goalie.Id]}
                      alt={`${goalie.FirstName} ${goalie.LastName}`}
                      radius='xl'
                      size={96}
                    />
                    <Text size='lg'>
                      {`${goalie.FirstName} ${goalie.LastName}`}
                      {goalie.JerseyNumber !== 0 && ` #${goalie.JerseyNumber}`}
                    </Text>
                  </div>
                </Link>
                <UpcomingGames goalie={goalie} sessions={sessions} />
              </Table.Td>
            ))}
            {rowIndex * 2 + 1 >= goalies.length && <Table.Td style={{ width: '50%' }} />}
          </Table.Tr>
        ))}
      </Table.Tbody>
    </Table>
  );
};

export const GoalieLoungePage = (): JSX.Element => {
  const { setPageInfo } = useTitle();
  const { loading, error, data } = useQuery(GET_USERS);
  const {
    loading: sessionsLoading,
    error: sessionsError,
    data: sessionsData,
  } = useQuery(GET_SESSIONS);
  const [avatars, setAvatars] = useState<Record<string, string>>({});

  useEffect(() => {
    setPageInfo('Goalie Lounge');
  }, [setPageInfo]);

  useEffect(() => {
    const loadAvatars = async (): Promise<void> => {
      const newAvatars: Record<string, string> = {};
      for (const user of data?.UsersEx ?? []) {
        const avatarUrl = await AvatarService.getAvatarUrl(user.PhotoUrl);
        newAvatars[user.Id] = avatarUrl;
      }
      setAvatars(newAvatars);
    };
    if (data?.UsersEx) {
      loadAvatars();
    }
  }, [data]);

  if (loading || sessionsLoading) return <LoadingSpinner />;
  if (error) return <Text c='red'>Error: {error.message}</Text>;
  if (sessionsError) return <Text c='red'>Error: {sessionsError.message}</Text>;

  const goalies =
    data?.UsersEx.filter(
      (user: User) => user.Active && user.PositionPreference == PositionPreference.Goalie,
    ) ?? [];
  return (
    <Container size='xl' mb='lg'>
      <Paper shadow='sm' p='md'>
        <Text size='xl' fw={500} mb='md'>
          Active Goalies ({goalies.length})
        </Text>
        <GoalieTableComponent
          goalies={goalies}
          avatars={avatars}
          sessions={sessionsData?.Sessions ?? []}
        />
      </Paper>
    </Container>
  );
};
