import styles from '@/App.module.css';
import { SessionCard } from '@/components/SessionCard';
import { Session } from '@/HockeyPickup.Api';
import { useTitle } from '@/layouts/TitleContext';
import { useAuth } from '@/lib/auth';
import { GET_SESSIONS } from '@/lib/queries';
import { useQuery } from '@apollo/client';
import { Box, Button, Container, Group, Image, Stack, Text } from '@mantine/core';
import { IconArrowRight } from '@tabler/icons-react';
import moment from 'moment';
import { JSX, useEffect } from 'react';
import { Link } from 'react-router-dom';

export const useUpcomingSessions = (): Session[] => {
  const { data } = useQuery(GET_SESSIONS, {
    fetchPolicy: 'network-only',
  });

  if (!data?.Sessions) return [];

  const futureSessions = data.Sessions.filter((session: Session) => {
    if (!session.SessionDate) return false;
    const localString = session.SessionDate.replace('Z', '');
    const sessionDate = moment(localString);
    const now = moment.tz('America/Los_Angeles');
    return sessionDate.isAfter(now);
  }).sort((a: Session, b: Session) => {
    if (!a.SessionDate || !b.SessionDate) return 0;
    const dateA = moment(a.SessionDate.replace('Z', ''));
    const dateB = moment(b.SessionDate.replace('Z', ''));
    return dateA.valueOf() - dateB.valueOf();
  });

  return futureSessions.slice(0, 2);
};

const SessionSection = ({
  title,
  session,
  image,
}: {
  title: string;
  session: Session;
  image: string;
}): JSX.Element => (
  <Box style={{ width: '100%', maxWidth: '1200px' }} px='md'>
    <Group justify='flex-end' w='100%'>
      <Text size='2.1rem' style={{ marginRight: 'auto' }}>
        {title}
      </Text>
      <Button
        variant='outline'
        component={Link}
        to='/sessions'
        rightSection={<IconArrowRight size={16} />}
        style={{
          color: '#339AF0',
          borderColor: '#1864AB',
          backgroundColor: 'rgba(24, 100, 171, 0.1)',
        }}
      >
        View All
      </Button>
    </Group>
    <Box mt='md'>
      <SessionCard session={session} image={image} />
    </Box>
  </Box>
);

export const HomePage = (): JSX.Element => {
  const { setPageInfo } = useTitle();
  const { user } = useAuth();
  const nextSessions = useUpcomingSessions();

  useEffect(() => {
    setPageInfo('Home', 'Hockey Pickup Home');
  }, [setPageInfo]);

  return (
    <Container size='xl' mb='lg' px={0}>
      <Stack align='center' gap='sm'>
        <Image
          src='/static/JB_Puck_Logo.png'
          alt='Hockey Pickup Logo'
          className={styles.headerLogo}
        />
        <Text size='xl' ta='center'>
          Welcome to Hockey Pickup
        </Text>
        <Text size='lg' c='gray.2' ta='center' maw={700} px='md' mb='lg'>
          To provide a safe skate for pickup hockey where players can improve their skills and have
          fun together.
        </Text>
        {!user ? (
          <Button component={Link} to='/login' size='lg'>
            Login
          </Button>
        ) : (
          <>
            {nextSessions[0] && (
              <SessionSection
                title='Next Session'
                session={nextSessions[0]}
                image='/static/two_hockey_players.jpg'
              />
            )}
            {nextSessions[1] && (
              <SessionSection
                title='Upcoming Pickup'
                session={nextSessions[1]}
                image='/static/hockey_celly.jpg'
              />
            )}
          </>
        )}
      </Stack>
    </Container>
  );
};
