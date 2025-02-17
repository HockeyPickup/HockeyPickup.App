import { AvatarUpload } from '@/components/AvatarUpload';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { PaymentButtons } from '@/components/PaymentButtons';
import { useRatingsVisibility } from '@/components/RatingsToggle';
import {
  AdminUserUpdateRequest,
  ErrorDetail,
  ImpersonationResponse,
  ImpersonationStatusResponse,
  NotificationPreference,
  PositionPreference,
  RevertImpersonationResponse,
  ShootPreference,
  UserDetailedResponse,
  UserStatsResponse,
} from '@/HockeyPickup.Api';
import { useTitle } from '@/layouts/TitleContext';
import { authService, TOKEN_KEY, useAuth } from '@/lib/auth';
import { ApiError } from '@/lib/error';
import { YOUTUBE_NAME_OVERRIDES } from '@/lib/overrides';
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
  Card,
  Checkbox,
  Container,
  Divider,
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
import { IconExternalLink, IconMail } from '@tabler/icons-react';
import moment from 'moment';
import { JSX, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const HeaderSection = ({
  profileUser,
}: {
  profileUser: UserDetailedResponse | null;
}): JSX.Element => {
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const { user, canViewRatings } = useAuth();
  const { showRatings } = useRatingsVisibility();
  const navigate = useNavigate();

  const { data: statsData } = useQuery(GET_USERSTATS, {
    variables: { UserId: profileUser?.Id },
    skip: !profileUser?.Id,
  });

  const stats: UserStatsResponse = statsData?.UserStats;

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
  const twoYear = currentYear - 2;

  return (
    <Card
      shadow='sm'
      p='lg'
      radius='md'
      withBorder
      style={{
        maxWidth: 820,
        background:
          'linear-gradient(45deg, var(--mantine-color-dark-7), var(--mantine-color-dark-6))',
        border: '2px solid var(--mantine-color-dark-4)',
      }}
    >
      {/* Header Section */}
      <Group justify='space-between' mb='md'>
        <Group>
          <Stack gap='xs'>
            <Avatar src={avatarUrl} size={180} radius='md' />
            <div>
              <Title order={2} mb={15}>
                {profileUser.FirstName} {profileUser.LastName}
                {profileUser.Id === user?.Id && ' (Me)'}
                {profileUser.JerseyNumber !== 0 && ` #${profileUser.JerseyNumber}`}
              </Title>
              <Group gap={5}>
                {profileUser.Active ? (
                  <Button
                    disabled
                    size='xs'
                    radius='xl'
                    color='green'
                    styles={{
                      root: {
                        paddingLeft: 14,
                        paddingRight: 14,
                        height: 22,
                        cursor: 'default',
                        backgroundColor: 'var(--mantine-color-green-filled)',
                        color: 'var(--mantine-color-white)',
                      },
                    }}
                  >
                    ACTIVE
                  </Button>
                ) : (
                  <Button
                    disabled
                    size='xs'
                    radius='xl'
                    color='red'
                    styles={{
                      root: {
                        paddingLeft: 14,
                        paddingRight: 14,
                        height: 22,
                        cursor: 'default',
                        backgroundColor: 'var(--mantine-color-red-filled)',
                        color: 'var(--mantine-color-white)',
                      },
                    }}
                  >
                    INACTIVE
                  </Button>
                )}
                {profileUser.Preferred && (
                  <Button
                    disabled
                    size='xs'
                    radius='xl'
                    color='blue'
                    styles={{
                      root: {
                        paddingLeft: 14,
                        paddingRight: 14,
                        height: 22,
                        cursor: 'default',
                        backgroundColor: 'var(--mantine-color-blue-filled)',
                        color: 'var(--mantine-color-white)',
                      },
                    }}
                  >
                    PREFERRED
                  </Button>
                )}
                {profileUser.PreferredPlus && (
                  <Button
                    disabled
                    size='xs'
                    radius='xl'
                    color='violet'
                    styles={{
                      root: {
                        paddingLeft: 14,
                        paddingRight: 14,
                        height: 22,
                        cursor: 'default',
                        backgroundColor: 'var(--mantine-color-violet-filled)',
                        color: 'var(--mantine-color-white)',
                      },
                    }}
                  >
                    PREFERRED+
                  </Button>
                )}
                {profileUser.LockerRoom13 && (
                  <Button
                    size='xs'
                    radius='xl'
                    color='yellow'
                    styles={{
                      root: {
                        paddingLeft: 14,
                        paddingRight: 14,
                        height: 22,
                      },
                    }}
                    onClick={() => navigate(`/lockerroom13`)}
                  >
                    LR13
                  </Button>
                )}
                <Button
                  size='xs'
                  radius='xl'
                  color='cyan'
                  styles={{
                    root: {
                      paddingLeft: 14,
                      paddingRight: 14,
                      height: 22,
                    },
                  }}
                  onClick={() =>
                    navigate(`/game-pucks?search=${profileUser.FirstName} ${profileUser.LastName}`)
                  }
                >
                  GAME PUCKS
                </Button>
                <Button
                  size='xs'
                  radius='xl'
                  color='red'
                  styles={{
                    root: {
                      paddingLeft: 14,
                      paddingRight: 14,
                      height: 22,
                    },
                  }}
                  component='a'
                  href={`https://www.youtube.com/results?search_query=${encodeURIComponent(
                    `"${YOUTUBE_NAME_OVERRIDES[`${profileUser.FirstName} ${profileUser.LastName}`] ?? profileUser.LastName}" from:pickupicehockey`,
                  )}`}
                  target='_blank'
                >
                  VIDEOS
                  <IconExternalLink
                    size={12}
                    style={{
                      marginLeft: 2,
                      marginTop: 4,
                      verticalAlign: 'middle',
                      marginBottom: 4,
                    }}
                  />
                </Button>
                {user?.Id !== profileUser.Id && <PaymentButtons user={profileUser} />}
                <Button
                  size='xs'
                  radius='xl'
                  color='gray'
                  component='a'
                  href={`mailto:${profileUser.Email}`}
                  styles={{
                    root: {
                      paddingLeft: 14,
                      paddingRight: 14,
                      height: 22,
                    },
                  }}
                >
                  <IconMail size={12} style={{ marginRight: 4 }} />
                  EMAIL {profileUser.FirstName}
                </Button>
              </Group>
            </div>
          </Stack>
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
                Shoots:
              </Text>
              <Text size='lg'>{ShootPreference[profileUser.Shoots ?? ShootPreference.TBD]}</Text>
            </Group>
            {profileUser.PositionPreference != PositionPreference.Goalie &&
              (stats?.WednesdayRegular || stats?.FridayRegular) && (
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
              )}
            {showRatings && canViewRatings() && (
              <Group gap={5}>
                <Text size='sm' fw={500} w={150} ta='right'>
                  Rating:
                </Text>
                <Text size='lg'>{profileUser?.Rating ?? 'N/A'}</Text>
              </Group>
            )}
          </Stack>
        </Card>
      </Group>

      {/* Stats Grid */}
      {profileUser.PositionPreference != PositionPreference.Goalie && (
        <Grid grow gutter='sm'>
          <Grid.Col span={{ base: 5 }}>
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
              <Group justify='space-between'>
                <Text>{twoYear}:</Text>
                <Text fw={700} size='xl'>
                  {stats?.TwoYearsAgoGamesPlayed ?? 0}
                </Text>
              </Group>
            </Stack>
          </Grid.Col>

          <Grid.Col span={{ base: 7 }}>
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
                <Text>{twoYear} Bought:</Text>
                <Text fw={700}>{stats?.TwoYearsAgoBoughtTotal ?? 0}</Text>
              </Group>
              <Group justify='space-between'>
                <Text>{twoYear} Sold:</Text>
                <Text fw={700}>{stats?.TwoYearsAgoSoldTotal ?? 0}</Text>
              </Group>
              <Divider size='md' />
              <Group justify='space-between'>
                <Text size='sm'>Open Buy Requests:</Text>
                <Text size='sm' fw={700}>
                  {stats?.CurrentBuyRequests ?? 0}
                </Text>
              </Group>
              <Group justify='space-between'>
                <Text size='sm'>Last Bought:</Text>
                <Text size='sm' fw={700}>
                  {stats?.LastBoughtSessionDate
                    ? moment.utc(stats.LastBoughtSessionDate).format('MM/DD/yyyy')
                    : 'N/A'}
                </Text>
              </Group>
              <Group justify='space-between'>
                <Text size='sm'>Last Sold:</Text>
                <Text size='sm' fw={700}>
                  {stats?.LastSoldSessionDate
                    ? moment.utc(stats.LastSoldSessionDate).format('MM/DD/yyyy')
                    : 'N/A'}
                </Text>
              </Group>
            </Stack>
          </Grid.Col>
        </Grid>
      )}
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
      EmergencyName: profileUser.EmergencyName ?? '',
      EmergencyPhone: profileUser.EmergencyPhone ?? '',
      JerseyNumber: profileUser.JerseyNumber ?? 0,
      NotificationPreference: profileUser.NotificationPreference ?? NotificationPreference.None,
      PositionPreference: profileUser.PositionPreference ?? PositionPreference.TBD,
      Shoots: profileUser?.Shoots ?? ShootPreference.TBD,
      Active: profileUser.Active,
      Preferred: profileUser.Preferred,
      PreferredPlus: profileUser.PreferredPlus,
      LockerRoom13: profileUser.LockerRoom13,
      Rating: profileUser.Rating,
    },
    transformValues: (values) => ({
      ...values,
      EmergencyPhone: values.EmergencyPhone?.trim() ?? '',
    }),
    validate: {
      FirstName: (value) => (!value ? 'First name is required' : null),
      LastName: (value) => (!value ? 'Last name is required' : null),
      JerseyNumber: (value) => {
        if (value === null || value === undefined) return null;
        const num = Number(value);
        if (!Number.isInteger(num)) return 'Must be a whole number';
        if (num < 1 || num > 98) return 'Must be between 1 and 98';
        return null;
      },
      EmergencyPhone: (value) =>
        value
          ? /^\+?1?\s*\(?[0-9]{3}\)?[-\s.]*[0-9]{3}[-\s.]*[0-9]{4}$/.test(value.trim())
            ? null
            : 'Invalid phone number'
          : null,
    },
  });

  return (
    <Paper withBorder shadow='md' p={30} mb='xl' radius='md' style={{ maxWidth: 420 }}>
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
            label='Jersey Number'
            placeholder='0'
            maxLength={2}
            {...form.getInputProps('JerseyNumber')}
          />
          <TextInput
            label='Emergency Contact Name'
            placeholder='Contact name'
            {...form.getInputProps('EmergencyName')}
          />
          <TextInput
            label='Emergency Contact Phone'
            placeholder='+1 (234) 567-8900'
            {...form.getInputProps('EmergencyPhone')}
          />
          <Select
            label='Notification Preference'
            data={[
              { value: NotificationPreference.None, label: NotificationPreference.None },
              { value: NotificationPreference.All, label: NotificationPreference.All },
              {
                value: NotificationPreference.OnlyMyBuySell,
                label: 'Only My Buy/Sell',
              },
            ]}
            value={form.values.NotificationPreference}
            onChange={(value) =>
              form.setFieldValue(
                'NotificationPreference',
                value ? (value as NotificationPreference) : NotificationPreference.None,
              )
            }
          />
          <Select
            label='Position Preference'
            data={[
              { value: PositionPreference.TBD, label: PositionPreference.TBD },
              { value: PositionPreference.Forward, label: PositionPreference.Forward },
              { value: PositionPreference.Defense, label: PositionPreference.Defense },
              { value: PositionPreference.Goalie, label: PositionPreference.Goalie },
            ]}
            value={form.values.PositionPreference?.toString()}
            onChange={(value) =>
              form.setFieldValue(
                'PositionPreference',
                value ? (value as PositionPreference) : PositionPreference.TBD,
              )
            }
          />
          <Select
            label='Shoot Preference'
            data={[
              { value: ShootPreference.TBD, label: ShootPreference.TBD },
              { value: ShootPreference.Left, label: ShootPreference.Left },
              { value: ShootPreference.Right, label: ShootPreference.Right },
            ]}
            value={form.values.Shoots?.toString()}
            onChange={(value) =>
              form.setFieldValue('Shoots', value ? (value as ShootPreference) : ShootPreference.TBD)
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
  const { isAdmin, isSubAdmin, user, setUser } = useAuth();
  const [profileUser, setProfileUser] = useState<UserDetailedResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [impersonationStatus, setImpersonationStatus] = useState<ImpersonationStatusResponse>();
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [apiErrors, setApiErrors] = useState<ErrorDetail[]>([]);
  const [showEmergencyInfo, setShowEmergencyInfo] = useState<boolean>(false);
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
      localStorage.setItem(TOKEN_KEY, response.Token);
      await authService.refreshUser(setUser);
      fetchImpersonationStatus();
    }
  };

  const handleRevertImpersonation = async (): Promise<void> => {
    const response: RevertImpersonationResponse | null = await revertImpersonation();
    if (response && response.Token) {
      localStorage.setItem(TOKEN_KEY, response.Token);
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
    } catch (error: unknown) {
      const apiError = error as ApiError;
      console.error('Save player failed:', apiError.response?.data?.Errors);
      if (apiError.response?.data?.Errors) {
        setApiErrors(apiError.response.data.Errors);
      } else {
        setApiErrors([{ Message: 'An unexpected error occurred while saving player' }]);
      }
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    getUserById(userId)
      .then((response) => {
        setProfileUser(response);
        setLoading(false);
        setPageInfo(
          response
            ? `Player Profile - ${response.FirstName} ${response.LastName}`
            : 'Player Profile',
        );
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
    <Container size='xl' mb={50} ml='sm'>
      <HeaderSection profileUser={profileUser} />
      <Group gap='xs'>
        {(isAdmin() || isSubAdmin()) && showRatings && (
          <>
            <Button
              size='xs'
              variant='light'
              onClick={() => setShowEmergencyInfo(!showEmergencyInfo)}
            >
              {showEmergencyInfo ? 'Hide' : 'Show'} Emergency Info
            </Button>
          </>
        )}
        {isAdmin() &&
          showRatings &&
          !impersonationStatus?.IsImpersonating &&
          user &&
          user.Id !== userId && (
            <Button size='xs' variant='light' onClick={handleImpersonate}>
              Impersonate
            </Button>
          )}
        {impersonationStatus?.IsImpersonating && user && user.Id === userId && (
          <Button size='xs' variant='light' onClick={handleRevertImpersonation}>
            Revert Impersonation
          </Button>
        )}
        {isAdmin() && showRatings && (
          <Button size='xs' variant='light' onClick={() => setIsEditing(!isEditing)}>
            {isEditing ? 'Cancel' : 'Admin Edit'}
          </Button>
        )}
      </Group>
      {showEmergencyInfo && profileUser && (
        <Paper p='xs' mt='xs' withBorder>
          <Stack>
            <Group>
              <Text fw={500}>Emergency Contact: {profileUser.EmergencyName ?? 'Not provided'}</Text>
            </Group>
            <Group>
              <Text fw={500}>Emergency Phone: {profileUser.EmergencyPhone ?? 'Not provided'}</Text>
            </Group>
          </Stack>
        </Paper>
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
