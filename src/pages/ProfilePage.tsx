import { AvatarUpload } from '@/components/AvatarUpload';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import {
  AdminUserUpdateRequest,
  ErrorDetail,
  ImpersonationResponse,
  ImpersonationStatusResponse,
  NotificationPreference,
  RevertImpersonationResponse,
  UserDetailedResponse,
} from '@/HockeyPickup.Api';
import { useTitle } from '@/layouts/TitleContext';
import { authService, useAuth } from '@/lib/auth';
import { GET_USERSTATS } from '@/lib/queries';
import {
  getImpersonationStatus,
  getUserById,
  impersonateUser,
  revertImpersonation,
} from '@/lib/user';
import { AvatarService } from '@/services/avatar';
import { useQuery } from '@apollo/client';
import {
  Avatar,
  Button,
  Checkbox,
  Container,
  Group,
  NumberInput,
  Paper,
  Select,
  Stack,
  Table,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
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

  const { data: statsData } = useQuery(GET_USERSTATS, {
    variables: { UserId: profileUser?.Id },
    skip: !profileUser?.Id,
  });

  const stats = statsData?.UserStats;

  const refreshAvatar = async (): Promise<void> => {
    const url = await AvatarService.getAvatarUrl(profileUser?.PhotoUrl ?? '');
    setAvatarUrl(url);
  };

  useEffect(() => {
    refreshAvatar();
  }, [profileUser]);

  if (!profileUser) return <Text>Player not found</Text>;

  return (
    <Paper withBorder p='md' mb='lg' bg='var(--mantine-color-dark-7)'>
      <Group>
        <Avatar
          src={avatarUrl}
          alt={`${profileUser.FirstName} ${profileUser.LastName}`}
          size={180}
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
            {profileUser.LockerRoom13 && (
              <Text size='sm'>
                Locker Room 13:{' '}
                <Text span c={profileUser.LockerRoom13 ? 'green.6' : 'red.6'}>
                  {profileUser.LockerRoom13 ? '✓' : '✗'}
                </Text>
              </Text>
            )}
          </Group>
          <Table mt='md' highlightOnHover>
            <Table.Tbody>
              <Table.Tr>
                <Table.Td>Player Since</Table.Td>
                <Table.Td>
                  {moment
                    .utc(stats?.MemberSince ?? profileUser.DateCreated)
                    .local()
                    .format('MM/DD/yyyy')}
                </Table.Td>
                <Table.Td>Most Played Position</Table.Td>
                <Table.Td>{stats?.MostPlayedPosition ?? 'N/A'}</Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td>Games This Year</Table.Td>
                <Table.Td>{stats?.CurrentYearGamesPlayed ?? 0}</Table.Td>
                <Table.Td>Games Last Year</Table.Td>
                <Table.Td>{stats?.PriorYearGamesPlayed ?? 0}</Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td>Bought This Year</Table.Td>
                <Table.Td>{stats?.CurrentYearBoughtTotal ?? 0}</Table.Td>
                <Table.Td>Bought Last Year</Table.Td>
                <Table.Td>{stats?.PriorYearBoughtTotal ?? 0}</Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td>Sold This Year</Table.Td>
                <Table.Td>{stats?.CurrentYearSoldTotal ?? 0}</Table.Td>
                <Table.Td>Sold Last Year</Table.Td>
                <Table.Td>{stats?.PriorYearSoldTotal ?? 0}</Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td>Last Bought Session</Table.Td>
                <Table.Td>
                  {stats?.LastBoughtSessionDate
                    ? moment.utc(stats.LastBoughtSessionDate).local().format('MM/DD/yyyy')
                    : 'N/A'}
                </Table.Td>
                <Table.Td>Last Sold Session</Table.Td>
                <Table.Td>
                  {stats?.LastSoldSessionDate
                    ? moment.utc(stats.LastSoldSessionDate).local().format('MM/DD/yyyy')
                    : 'N/A'}
                </Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td>Active Buy Requests</Table.Td>
                <Table.Td>{stats?.CurrentBuyRequests ?? 0}</Table.Td>
                <Table.Td>Regular Player</Table.Td>
                <Table.Td>
                  {[stats?.WednesdayRegular && 'Wednesday', stats?.FridayRegular && 'Friday']
                    .filter(Boolean)
                    .join(', ') || 'No'}
                </Table.Td>
              </Table.Tr>
            </Table.Tbody>
          </Table>{' '}
        </div>
      </Group>
    </Paper>
  );
};

const EditUserForm = ({
  profileUser,
  onSave,
  isLoading,
  apiErrors,
  onUploadSuccess,
}: {
  profileUser: UserDetailedResponse;
  onSave: (_values: AdminUserUpdateRequest) => Promise<void>;
  isLoading: boolean;
  apiErrors: ErrorDetail[];
  onUploadSuccess: () => Promise<void>;
}): JSX.Element => {
  const form = useForm<AdminUserUpdateRequest>({
    initialValues: {
      UserId: profileUser.Id,
      FirstName: profileUser.FirstName ?? '',
      LastName: profileUser.LastName ?? '',
      PayPalEmail: profileUser.PayPalEmail ?? '',
      VenmoAccount: profileUser.VenmoAccount ?? '',
      MobileLast4: profileUser.MobileLast4 ?? '',
      EmergencyName: profileUser.EmergencyName ?? '',
      EmergencyPhone: profileUser.EmergencyPhone ?? '',
      NotificationPreference: profileUser.NotificationPreference ?? NotificationPreference.None,
      Active: profileUser.Active,
      Preferred: profileUser.Preferred,
      PreferredPlus: profileUser.PreferredPlus,
      LockerRoom13: profileUser.LockerRoom13,
      Rating: profileUser.Rating,
    },
    validate: {
      FirstName: (value) => (!value ? 'First name is required' : null),
      LastName: (value) => (!value ? 'Last name is required' : null),
      PayPalEmail: (value) => {
        if (!value) return 'PayPal email is required';
        return /^\S+@\S+$/.test(value) ? null : 'Invalid email format';
      },
      MobileLast4: (value) => (value ? (/^\d{4}$/.test(value) ? null : 'Must be 4 digits') : null),
      EmergencyPhone: (value) =>
        value ? (/^\+?[\d\s-]{10,}$/.test(value) ? null : 'Invalid phone number') : null,
    },
  });

  return (
    <Paper withBorder shadow='md' p={30} radius='md' style={{ maxWidth: 420 }}>
      <Title size='xl'>Edit Player</Title>
      <form onSubmit={form.onSubmit(onSave)}>
        <Stack>
          <AvatarUpload userId={profileUser.Id} onUploadSuccess={onUploadSuccess} />
          <TextInput
            label='First Name'
            placeholder='First name'
            {...form.getInputProps('FirstName')}
          />
          <TextInput
            label='Last Name'
            placeholder='Last name'
            {...form.getInputProps('LastName')}
          />
          <TextInput
            label='PayPal Email'
            placeholder='email@example.com'
            {...form.getInputProps('PayPalEmail')}
          />
          <TextInput
            label='Venmo Account'
            placeholder='@username'
            {...form.getInputProps('VenmoAccount')}
          />
          <TextInput
            label='Mobile Last 4 Digits'
            placeholder='1234'
            maxLength={4}
            {...form.getInputProps('MobileLast4')}
          />
          <TextInput
            label='Emergency Contact Name'
            placeholder='Contact name'
            {...form.getInputProps('EmergencyName')}
          />
          <TextInput
            label='Emergency Contact Phone'
            placeholder='+1 234 567 8900'
            {...form.getInputProps('EmergencyPhone')}
          />
          <Select
            label='Notification Preference'
            data={[
              { value: NotificationPreference.None.toString(), label: 'None' },
              { value: NotificationPreference.All.toString(), label: 'All' },
              { value: NotificationPreference.OnlyMyBuySell.toString(), label: 'Only My Buy/Sell' },
            ]}
            value={form.values.NotificationPreference?.toString()}
            onChange={(value) =>
              form.setFieldValue(
                'NotificationPreference',
                value ? (parseInt(value) as NotificationPreference) : null,
              )
            }
          />
          <Checkbox label='Active' {...form.getInputProps('Active', { type: 'checkbox' })} />
          <Checkbox label='Preferred' {...form.getInputProps('Preferred', { type: 'checkbox' })} />
          <Checkbox
            label='Preferred Plus'
            {...form.getInputProps('PreferredPlus', { type: 'checkbox' })}
          />
          <Checkbox
            label='Locker Room 13'
            {...form.getInputProps('LockerRoom13', { type: 'checkbox' })}
          />
          <NumberInput label='Rating' step={0.5} {...form.getInputProps('Rating')} />

          {apiErrors.length > 0 && (
            <Stack gap='xs'>
              {apiErrors.map((error, index) => (
                <Text key={index} c='red' size='sm'>
                  {error.Message}
                </Text>
              ))}
            </Stack>
          )}

          <Button type='submit' mb='md' fullWidth loading={isLoading}>
            Save Player
          </Button>
        </Stack>
      </form>
    </Paper>
  );
};

export const ProfilePage = (): JSX.Element => {
  const { userId } = useParams();
  const { setPageInfo } = useTitle();
  const { isAdmin, user, setUser } = useAuth();
  const [profileUser, setProfileUser] = useState<UserDetailedResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [impersonationStatus, setImpersonationStatus] = useState<ImpersonationStatusResponse>();
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [apiErrors, setApiErrors] = useState<ErrorDetail[]>([]);

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

  const handleSaveUser = async (values: AdminUserUpdateRequest): Promise<void> => {
    setIsSaving(true);
    setApiErrors([]);

    try {
      const response = await authService.adminSaveUser({ ...values });
      if (response.Success) {
        notifications.show({
          position: 'top-center',
          autoClose: 5000,
          style: { marginTop: '60px' },
          title: 'Success',
          message: 'Player has been updated successfully',
          color: 'green',
        });
        getUserById(userId).then((response) => {
          setProfileUser(response);
          setIsEditing(false);
        });
      } else if (response.Errors) {
        setApiErrors(response.Errors);
      }
    } catch (error: any) {
      console.error('Save player failed:', error.response?.data.Errors);
      if (error.response?.data?.Errors) {
        setApiErrors(error.response.data.Errors);
      } else {
        setApiErrors([{ Message: 'An unexpected error occurred while saving player' }]);
      }
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    setPageInfo('Player Profile');
    getUserById(userId)
      .then((response) => {
        setProfileUser(response);
        setLoading(false);
      })
      .catch(() => {
        setProfileUser(null);
        setLoading(false);
      });
  }, [setPageInfo, userId]);

  if (loading) return <LoadingSpinner />;

  const refreshProfile = async (): Promise<void> => {
    if (userId) {
      const response = await getUserById(userId);
      setProfileUser(response);
    }
  };

  return (
    <Container size='xl' mb='lg' ml='sm'>
      <HeaderSection profileUser={profileUser} />
      {isAdmin() && !impersonationStatus?.IsImpersonating && user && user.Id !== userId && (
        <Button onClick={handleImpersonate}>Impersonate</Button>
      )}
      {impersonationStatus?.IsImpersonating && user && user.Id === userId && (
        <Button onClick={handleRevertImpersonation}>Revert Impersonation</Button>
      )}{' '}
      {isAdmin() && (
        <Button onClick={() => setIsEditing(!isEditing)}>
          {isEditing ? 'Cancel' : 'Admin Edit'}
        </Button>
      )}
      {isEditing && profileUser && (
        <EditUserForm
          profileUser={profileUser}
          onSave={handleSaveUser}
          isLoading={isSaving}
          apiErrors={apiErrors}
          onUploadSuccess={refreshProfile}
        />
      )}
    </Container>
  );
};
