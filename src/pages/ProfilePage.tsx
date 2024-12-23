import { UserDetailedResponse } from '@/HockeyPickup.Api';
import { useTitle } from '@/layouts/TitleContext';
import { useAuth } from '@/lib/auth';
import { getUserById } from '@/lib/user';
import { Container, Group, Paper, Text, Title } from '@mantine/core';
import moment from 'moment';
import { JSX, useEffect, useState } from 'react';

const HeaderSection = ({ user }: { user: UserDetailedResponse | null }): JSX.Element => {
  const { isAdmin, isSubAdmin } = useAuth();

  if (!user) return <Text>Player not found</Text>;

  return (
    <Paper withBorder p='md' mb='lg' bg='var(--mantine-color-dark-7)'>
      <Title order={2}>
        {user.FirstName} {user.LastName}
      </Title>
      {isAdmin() || isSubAdmin() ? (
        <Group justify='left' gap='xs'>
          <Text size='xs'>
            Role{isAdmin() && isSubAdmin() && 's'}: {isAdmin() && 'Admin'}
            {isAdmin() && isSubAdmin() && ', '}
            {isSubAdmin() && 'SubAdmin'}
          </Text>
        </Group>
      ) : null}
      <Group mt='md'>
        <Text size='sm'>
          Active:{' '}
          <Text span c={user.Active ? 'green.6' : 'red.6'}>
            {user.Active ? '✓' : '✗'}
          </Text>
        </Text>
        <Text size='sm'>
          Preferred:{' '}
          <Text span c={user.Preferred ? 'green.6' : 'red.6'}>
            {user.Preferred ? '✓' : '✗'}
          </Text>
        </Text>
        <Text size='sm'>
          Preferred Plus:{' '}
          <Text span c={user.PreferredPlus ? 'green.6' : 'red.6'}>
            {user.PreferredPlus ? '✓' : '✗'}
          </Text>
        </Text>
        <Text size='sm'>
          Locker Room 13:{' '}
          <Text span c={user.LockerRoom13 ? 'green.6' : 'red.6'}>
            {user.LockerRoom13 ? '✓' : '✗'}
          </Text>
        </Text>
      </Group>
      <br />
      <Group>
        <Text size='sm'>
          Player Since:{' '}
          <Text span fw={500}>
            {moment.utc(user.DateCreated).local().format('MM/DD/yyyy')}
          </Text>
        </Text>
        <Text size='sm'>
          Sessions Played:{' '}
          <Text span fw={500}>
            999
          </Text>
        </Text>
        <Text size='sm'>
          Last Session:{' '}
          <Text span fw={500}>
            01/01/2030
          </Text>
        </Text>
      </Group>
    </Paper>
  );
};

export const ProfilePage = (userId: string): JSX.Element => {
  const { setTitle } = useTitle();
  const [user, setUser] = useState<UserDetailedResponse | null>(null);

  useEffect(() => {
    setTitle('Player Profile');
    getUserById(userId)
      .then((response) => {
        setUser(response.data);
      })
      .catch(() => {
        setUser(null);
      });
  }, [setTitle, userId]);

  return (
    <Container size='xl'>
      <HeaderSection user={user} />
    </Container>
  );
};
