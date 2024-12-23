import { LoadingSpinner } from '@/components/LoadingSpinner';
import {
  ImpersonationResponse,
  ImpersonationStatusResponse,
  RevertImpersonationResponse,
  UserDetailedResponse,
} from '@/HockeyPickup.Api';
import { useTitle } from '@/layouts/TitleContext';
import { authService, useAuth } from '@/lib/auth';
import {
  getImpersonationStatus,
  getUserById,
  impersonateUser,
  revertImpersonation,
} from '@/lib/user';
import { AvatarService } from '@/services/avatar';
import { Avatar, Button, Container, Group, Paper, Text, Title } from '@mantine/core';
import moment from 'moment';
import { JSX, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const HeaderSection = ({
  profileUser,
}: {
  profileUser: UserDetailedResponse | null;
}): JSX.Element => {
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const { user } = useAuth();

  useEffect(() => {
    const loadAvatar = async (): Promise<void> => {
      if (profileUser?.Email) {
        const url = await AvatarService.getAvatarUrl(
          profileUser.Email,
          `${profileUser.FirstName} ${profileUser.LastName}`,
          {
            size: 80,
            fallbackType: 'initials',
          },
        );
        setAvatarUrl(url);
      }
    };
    loadAvatar();
  }, [profileUser?.Email]);

  if (!profileUser) return <Text>Player not found</Text>;

  return (
    <Paper withBorder p='md' mb='lg' bg='var(--mantine-color-dark-7)'>
      <Group>
        <Avatar
          src={avatarUrl}
          alt={`${profileUser.FirstName} ${profileUser.LastName}`}
          size={80}
          radius='xl'
        />
        <div>
          <Title order={2}>
            {profileUser.FirstName} {profileUser.LastName} {profileUser.Id === user?.Id && '(Me)'}
          </Title>
          <Group mt='md'>
            <Text size='sm'>
              Active:{' '}
              <Text span c={profileUser.Active ? 'green.6' : 'red.6'}>
                {profileUser.Active ? '✓' : '✗'}
              </Text>
            </Text>
            <Text size='sm'>
              Preferred:{' '}
              <Text span c={profileUser.Preferred ? 'green.6' : 'red.6'}>
                {profileUser.Preferred ? '✓' : '✗'}
              </Text>
            </Text>
            <Text size='sm'>
              Preferred Plus:{' '}
              <Text span c={profileUser.PreferredPlus ? 'green.6' : 'red.6'}>
                {profileUser.PreferredPlus ? '✓' : '✗'}
              </Text>
            </Text>
            <Text size='sm'>
              Locker Room 13:{' '}
              <Text span c={profileUser.LockerRoom13 ? 'green.6' : 'red.6'}>
                {profileUser.LockerRoom13 ? '✓' : '✗'}
              </Text>
            </Text>
          </Group>
          <br />
          <Group>
            <Text size='sm'>
              Player Since:{' '}
              <Text span fw={500}>
                {moment.utc(profileUser.DateCreated).local().format('MM/DD/yyyy')}
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
  const { isAdmin, user, setUser } = useAuth();
  const [profileUser, setProfileUser] = useState<UserDetailedResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [impersonationStatus, setImpersonationStatus] = useState<ImpersonationStatusResponse>();

  const fetchImpersonationStatus = async (): Promise<void> => {
    const status: ImpersonationStatusResponse | null = await getImpersonationStatus();
    if (status) {
      setImpersonationStatus(status);
    }
  };

  useEffect(() => {
    fetchImpersonationStatus();
  }, []);

  const handleImpersonate = async (): Promise<void> => {
    if (!userId) return;

    const response: ImpersonationResponse | null = await impersonateUser(userId);
    if (response && response.Token) {
      localStorage.setItem('auth_token', response.Token);
      await authService.refreshUser(setUser);
      fetchImpersonationStatus();
    }
  };

  const handleRevertImpersonation = async (): Promise<void> => {
    const response: RevertImpersonationResponse | null = await revertImpersonation();
    if (response && response.Token) {
      localStorage.setItem('auth_token', response.Token);
      await authService.refreshUser(setUser);
      fetchImpersonationStatus();
    }
  };

  useEffect(() => {
    setTitle('Player Profile');
    getUserById(userId)
      .then((response) => {
        setProfileUser(response);
        setLoading(false);
      })
      .catch(() => {
        setProfileUser(null);
        setLoading(false);
      });
  }, [setTitle, userId]);

  if (loading) return <LoadingSpinner />;

  return (
    <Container size='xl'>
      <HeaderSection profileUser={profileUser} />
      {isAdmin() && !impersonationStatus?.IsImpersonating && user && user.Id !== userId && (
        <Button onClick={handleImpersonate}>Impersonate</Button>
      )}
      {impersonationStatus?.IsImpersonating && (
        <Button onClick={handleRevertImpersonation}>Revert Impersonation</Button>
      )}
    </Container>
  );
};
