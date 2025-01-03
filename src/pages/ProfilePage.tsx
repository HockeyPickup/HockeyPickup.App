import { AvatarUpload } from '@/components/AvatarUpload';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useRatingsVisibility } from '@/components/RatingsToggle';
import {
  AdminUserUpdateRequest,
  ErrorDetail,
  ImpersonationResponse,
  ImpersonationStatusResponse,
  NotificationPreference,
  PositionPreference,
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
  Badge,
  Button,
  Card,
  Checkbox,
  Container,
  Grid,
  Group,
  NumberInput,
  Paper,
  Select,
  Stack,
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
  const { user, canViewRatings } = useAuth();
  const { showRatings } = useRatingsVisibility();

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

  const currentYear = moment().year();
  const lastYear = currentYear - 1;

  return (
    <Card
      shadow='sm'
      p='lg'
      radius='md'
      withBorder
      style={{
        maxWidth: 800,
        background:
          'linear-gradient(45deg, var(--mantine-color-dark-7), var(--mantine-color-dark-6))',
        border: '2px solid var(--mantine-color-dark-4)',
      }}
    >
      {/* Header Section */}
      <Group justify='space-between' mb='md'>
        <Group>
          <Avatar src={avatarUrl} size={120} radius='md' />
          <div>
            <Title order={2} mb={5}>
              {profileUser.FirstName} {profileUser.LastName}
              {profileUser.Id === user?.Id && ' (Me)'}
            </Title>
            <Group gap={5}>
              {profileUser.Active && <Badge color='green'>Active</Badge>}
              {profileUser.Preferred && <Badge color='blue'>Preferred</Badge>}
              {profileUser.PreferredPlus && <Badge color='violet'>Preferred+</Badge>}
              {profileUser.LockerRoom13 && <Badge color='yellow'>LR13</Badge>}
            </Group>
          </div>
        </Group>
        <Card
          p='md'
          radius='md'
          style={{
            background: 'var(--mantine-color-dark-6)',
            border: '1px solid var(--mantine-color-dark-4)',
            width: '100%',
          }}
        >
          <Stack gap={5}>
            <Group gap={5}>
              <Text size='sm' fw={500} w={150} ta='right'>
                Player Since:
              </Text>
              <Text size='lg'>
                {moment
                  .utc(stats?.MemberSince ?? profileUser.DateCreated)
                  .local()
                  .format('MM/DD/yyyy')}
              </Text>
            </Group>
            <Group gap={5}>
              <Text size='sm' fw={500} w={150} ta='right'>
                Position Preference:
              </Text>
              <Text size='lg'>
                {PositionPreference[profileUser.PositionPreference ?? PositionPreference.TBD]}
              </Text>
            </Group>
            <Group gap={5}>
              <Text size='sm' fw={500} w={150} ta='right'>
                Regular Player:
              </Text>
              <Text size='lg'>
                {[stats?.WednesdayRegular && 'Wednesday', stats?.FridayRegular && 'Friday']
                  .filter(Boolean)
                  .join(', ') || 'No'}
              </Text>
            </Group>
            {showRatings && canViewRatings && (
              <Group gap={5}>
                <Text size='sm' fw={500} w={150} ta='right'>
                  Rating:
                </Text>
                <Text size='lg'>{profileUser?.Rating ?? 'N/A'}</Text>
              </Group>
            )}
          </Stack>
        </Card>{' '}
      </Group>

      {/* Stats Grid */}
      <Grid grow gutter='xl'>
        <Grid.Col span={6}>
          <Stack gap='xs'>
            <Title order={4} c='dimmed'>
              Games Played
            </Title>
            <Group justify='space-between'>
              <Text>{currentYear}:</Text>
              <Text fw={700} size='xl'>
                {stats?.CurrentYearGamesPlayed ?? 0}
              </Text>
            </Group>
            <Group justify='space-between'>
              <Text>{lastYear}:</Text>
              <Text fw={700} size='xl'>
                {stats?.PriorYearGamesPlayed ?? 0}
              </Text>
            </Group>
          </Stack>
        </Grid.Col>

        <Grid.Col span={6}>
          <Stack gap='xs'>
            <Title order={4} c='dimmed'>
              Transactions
            </Title>
            <Group justify='space-between'>
              <Text>{currentYear} Bought:</Text>
              <Text fw={700}>{stats?.CurrentYearBoughtTotal ?? 0}</Text>
            </Group>
            <Group justify='space-between'>
              <Text>{currentYear} Sold:</Text>
              <Text fw={700}>{stats?.CurrentYearSoldTotal ?? 0}</Text>
            </Group>
            <Group justify='space-between'>
              <Text>{lastYear} Bought:</Text>
              <Text fw={700}>{stats?.PriorYearBoughtTotal ?? 0}</Text>
            </Group>
            <Group justify='space-between'>
              <Text>{lastYear} Sold:</Text>
              <Text fw={700}>{stats?.PriorYearSoldTotal ?? 0}</Text>
            </Group>
            <Group justify='space-between'>
              <Text>Open Buy Requests:</Text>
              <Text fw={700}>{stats?.CurrentBuyRequests ?? 0}</Text>
            </Group>
            <Group justify='space-between'>
              <Text>Last Bought:</Text>
              <Text fw={700}>
                {stats?.LastBoughtSessionDate
                  ? moment.utc(stats.LastBoughtSessionDate).local().format('MM/DD/yyyy')
                  : 'N/A'}
              </Text>
            </Group>
            <Group justify='space-between'>
              <Text>Last Sold:</Text>
              <Text fw={700}>
                {stats?.LastSoldSessionDate
                  ? moment.utc(stats.LastSoldSessionDate).local().format('MM/DD/yyyy')
                  : 'N/A'}
              </Text>
            </Group>
          </Stack>
        </Grid.Col>
      </Grid>
    </Card>
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
      PositionPreference: profileUser.PositionPreference ?? PositionPreference.TBD,
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
        value
          ? /^\+?1?\s*\(?[0-9]{3}\)?[-\s.]*[0-9]{3}[-\s.]*[0-9]{4}$/.test(value)
            ? null
            : 'Invalid phone number'
          : null,
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
          <Select
            label='Position Preference'
            data={[
              { value: PositionPreference.TBD.toString(), label: 'TBD' },
              { value: PositionPreference.Forward.toString(), label: 'Forward' },
              { value: PositionPreference.Defense.toString(), label: 'Defense' },
              { value: PositionPreference.Goalie.toString(), label: 'Goalie' },
            ]}
            value={form.values.PositionPreference?.toString()}
            onChange={(value) =>
              form.setFieldValue(
                'PositionPreference',
                value ? (parseInt(value) as PositionPreference) : null,
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
  const { showRatings } = useRatingsVisibility();

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
      {isAdmin() &&
        showRatings &&
        !impersonationStatus?.IsImpersonating &&
        user &&
        user.Id !== userId && <Button onClick={handleImpersonate}>Impersonate</Button>}
      {impersonationStatus?.IsImpersonating && user && user.Id === userId && (
        <Button onClick={handleRevertImpersonation}>Revert Impersonation</Button>
      )}{' '}
      {isAdmin() && showRatings && (
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
