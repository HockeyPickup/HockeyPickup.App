import styles from '@/App.module.css';
import { PlayerDashboard } from '@/components/dashboard/PlayerDashboard';
import { useTitle } from '@/layouts/TitleContext';
import { useAuth } from '@/lib/auth';
import { Button, Container, Image, Stack, Text } from '@mantine/core';
import { JSX, useEffect } from 'react';
import { Link } from 'react-router-dom';

/**
 * Anonymous visitors still get the club's landing page; signed-in players get their dashboard.
 * `/` is a public route, so both branches have to stand on their own.
 */
const WelcomeLanding = (): JSX.Element => (
  <Container size='xl' mb='lg' px={0}>
    <Stack align='center' gap='sm'>
      <Image src='/static/JB_Puck_Logo.png' alt='Hockey Pickup Logo' className={styles.headerLogo} />
      <Text size='xl' ta='center'>
        Welcome to John Bryan&apos;s Pickup Hockey
      </Text>
      <Text size='lg' c='gray.2' ta='center' maw={700} px='md' mb='lg'>
        <b>Our Mission</b>: To provide a safe skate for pickup hockey where players can improve
        their skills and have fun together.
      </Text>
      <Button component={Link} to='/login' size='lg'>
        Login
      </Button>
    </Stack>
  </Container>
);

export const HomePage = (): JSX.Element => {
  const { setPageInfo } = useTitle();
  const { user } = useAuth();

  useEffect(() => {
    setPageInfo('Home', "John Bryan's Pickup Hockey Home");
  }, [setPageInfo]);

  return user ? <PlayerDashboard user={user} /> : <WelcomeLanding />;
};
