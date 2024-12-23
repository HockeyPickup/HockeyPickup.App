import { UserDetailedResponse } from '@/HockeyPickup.Api';
import { useTitle } from '@/layouts/TitleContext';
import { getUserById } from '@/lib/user';
import { AvatarService } from '@/services/avatar';
import { Avatar, Container, Group, Paper, Text, Title } from '@mantine/core';
import moment from 'moment';
import { JSX, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const HeaderSection = ({ user }: { user: UserDetailedResponse | null }): JSX.Element => {
  const [avatarUrl, setAvatarUrl] = useState<string>('');

  useEffect(() => {
    const loadAvatar = async (): Promise<void> => {
      if (user?.Email) {
        const url = await AvatarService.getAvatarUrl(
          user.Email,
          `${user.FirstName} ${user.LastName}`,
          {
            size: 80,
            fallbackType: 'initials',
          },
        );
        setAvatarUrl(url);
      }
    };
    loadAvatar();
  }, [user?.Email]);

  if (!user) return <Text>Player not found</Text>;

  return (
    <Paper withBorder p='md' mb='lg' bg='var(--mantine-color-dark-7)'>
      <Group>
        <Avatar src={avatarUrl} alt={`${user.FirstName} ${user.LastName}`} size={80} radius='xl' />
        <div>
          <Title order={2}>
            {user.FirstName} {user.LastName}
          </Title>
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
        </div>
      </Group>
    </Paper>
  );
};

export const ProfilePage = (): JSX.Element => {
  const { userId } = useParams();
  const { setTitle } = useTitle();
  const [user, setUser] = useState<UserDetailedResponse | null>(null);

  useEffect(() => {
    setTitle('Player Profile');
    getUserById(userId)
      .then((response) => {
        setUser(response);
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
