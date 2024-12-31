import styles from '@/App.module.css';
import { SessionDisplay, SessionsTable } from '@/layouts/SessionsTable';
import { useTitle } from '@/layouts/TitleContext';
import { useAuth } from '@/lib/auth';
import { Button, Container, Image, Stack, Text } from '@mantine/core';
import { JSX, useEffect } from 'react';
import { Link } from 'react-router-dom';

export const HomePage = (): JSX.Element => {
  const { setTitle } = useTitle();
  const { user } = useAuth();

  useEffect(() => {
    setTitle('Home');
  }, [setTitle]);

  return (
    <Container size='xl' mb='lg'>
      <Stack align='center' gap='sm'>
        <Image
          src='/static/JB_Puck_Logo.png'
          alt='Hockey Pickup Logo'
          className={styles.headerLogo}
        />{' '}
        <Text size='xl' w={700} ta='center'>
          Welcome to Hockey Pickup
        </Text>
        {!user ? (
          <Button component={Link} to='/login' size='lg'>
            Login
          </Button>
        ) : (
          <>
            <Text size='xl' mt='xl'>
              Upcoming Sessions
            </Text>
            <SessionsTable display={SessionDisplay.Future} />
          </>
        )}
      </Stack>
    </Container>
  );
};
