import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useRatingsVisibility } from '@/components/RatingsToggle';
import { RegularDetailedResponse, RegularSetDetailedResponse } from '@/HockeyPickup.Api';
import { useTitle } from '@/layouts/TitleContext';
import { useAuth } from '@/lib/auth';
import { getPositionString } from '@/lib/position';
import { GET_REGULARSETS } from '@/lib/queries';
import { regularService } from '@/lib/regular';
import { Team, TEAM_LABELS } from '@/lib/team';
import { AvatarService } from '@/services/avatar';
import { useQuery } from '@apollo/client';
import {
  ActionIcon,
  Avatar,
  Button,
  Checkbox,
  Collapse,
  Container,
  CopyButton,
  Grid,
  Group,
  Image,
  Paper,
  Select,
  Space,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconCheck, IconCopy, IconEdit } from '@tabler/icons-react';
import moment from 'moment';
import { JSX, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const EditRegularSetForm = ({
  regularSet,
  onSave,
  onCancel,
}: {
  regularSet: RegularSetDetailedResponse;
  onSave: () => void;
  onCancel: () => void;
}): JSX.Element => {
  const form = useForm({
    initialValues: {
      description: regularSet.Description ?? '',
      dayOfWeek: regularSet.DayOfWeek,
      archived: regularSet.Archived,
    },
  });

  const handleSubmit = async (values: typeof form.values): Promise<void> => {
    try {
      await regularService.updateRegularSet(
        regularSet.RegularSetId,
        values.description,
        values.dayOfWeek,
        values.archived,
      );

      notifications.show({
        position: 'top-center',
        autoClose: 5000,
        style: { marginTop: '60px' },
        title: 'Success',
        message: 'Regular set updated successfully',
        color: 'green',
      });

      onSave();
    } catch (error) {
      console.error('Failed to update regular set:', error);
      notifications.show({
        position: 'top-center',
        autoClose: 5000,
        style: { marginTop: '60px' },
        title: 'Error',
        message: 'Failed to update regular set',
        color: 'red',
      });
    }
  };

  const dayOptions = [
    { value: '1', label: 'Saturday' },
    { value: '2', label: 'Sunday' },
    { value: '3', label: 'Monday' },
    { value: '4', label: 'Tuesday' },
    { value: '5', label: 'Wednesday' },
    { value: '6', label: 'Thursday' },
    { value: '7', label: 'Friday' },
  ];

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack>
        <TextInput
          label='Description'
          placeholder='Enter description'
          {...form.getInputProps('description')}
        />
        <Select
          label='Day of Week'
          placeholder='Select day'
          data={dayOptions}
          value={form.values.dayOfWeek.toString()}
          onChange={(value) => form.setFieldValue('dayOfWeek', parseInt(value ?? '0'))}
        />{' '}
        <Checkbox label='Archived' {...form.getInputProps('archived', { type: 'checkbox' })} />
        <Group justify='flex-end'>
          <Button variant='outline' onClick={onCancel}>
            Cancel
          </Button>
          <Button type='submit'>Save</Button>
        </Group>
      </Stack>
    </form>
  );
};

export const RegularsPage = (): JSX.Element => {
  const { setTitle } = useTitle();
  const { isAdmin, canViewRatings } = useAuth();
  const { showRatings } = useRatingsVisibility();
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [includeArchived, setIncludeArchived] = useState<boolean>(false);
  const [showEmails, setShowEmails] = useState(false);
  const [editingRegularSet, setEditingRegularSet] = useState<boolean>(false);

  const { loading, data, refetch } = useQuery<{ RegularSets: RegularSetDetailedResponse[] }>(
    GET_REGULARSETS,
  );

  useEffect(() => {
    setTitle('Regulars');
  }, [setTitle]);

  if (loading) return <LoadingSpinner />;

  const regularSetOptions =
    data?.RegularSets?.filter((s) => includeArchived || !s.Archived).map((s) => ({
      value: s.RegularSetId.toString(),
      label: s.Description ?? '',
    })) ?? [];

  const selectedPresetData = data?.RegularSets?.find(
    (set) => set.RegularSetId.toString() === selectedPreset,
  );

  const handleEditComplete = async (): Promise<void> => {
    setEditingRegularSet(false);
    await refetch();
  };

  const getTeamRegulars = (teamId: Team.Light | Team.Dark): RegularDetailedResponse[] => {
    return (
      selectedPresetData?.Regulars?.filter((regular) => regular.TeamAssignment === teamId).sort(
        (a, b) => {
          // Sort by position (Defense first)
          if (a.PositionPreference !== b.PositionPreference) {
            return b.PositionPreference - a.PositionPreference; // Defense (2) before Forward (1)
          }
          // Then by first name
          return (a.User?.FirstName ?? '').localeCompare(b.User?.FirstName ?? '');
        },
      ) ?? []
    );
  };

  const getTeamEmails = (teamId: Team.Light | Team.Dark): string[] => {
    return getTeamRegulars(teamId)
      .map((regular) => regular.User?.Email)
      .filter(Boolean) as string[];
  };

  const getAllEmails = (): string => {
    const lightEmails = getTeamEmails(Team.Light);
    const darkEmails = getTeamEmails(Team.Dark);
    return [...lightEmails, ...darkEmails].sort((a, b) => a.localeCompare(b)).join('\n');
  };

  const TeamSection = ({ teamId }: { teamId: Team.Light | Team.Dark }): JSX.Element => {
    const teamRegulars = getTeamRegulars(teamId);
    const [avatars, setAvatars] = useState<Record<string, string>>({});
    const teamRegularsKey = teamRegulars
      .map((regular) => regular.UserId)
      .sort()
      .join(',');

    useEffect(() => {
      const loadAvatars = async (): Promise<void> => {
        const newAvatars: Record<string, string> = {};
        for (const regular of teamRegulars) {
          if (regular.User?.Email) {
            const avatarUrl = await AvatarService.getAvatarUrl(
              regular.User.Email,
              `${regular.User.FirstName} ${regular.User.LastName}`,
              {
                size: 24,
                fallbackType: 'initials',
              },
            );
            newAvatars[regular.UserId] = avatarUrl;
          }
        }
        setAvatars(newAvatars);
      };
      loadAvatars();
    }, [teamRegularsKey]);

    if (teamRegulars.length === 0) return <></>;

    const calculateTeamRatings = (): { total: string; average: string } => {
      const playersWithRatings = teamRegulars.filter(
        (regular) => regular.User?.Rating !== undefined && regular.User.Rating !== null,
      );
      const total = playersWithRatings.reduce(
        (sum, regular) => sum + (regular.User?.Rating ?? 0),
        0,
      );
      const avg = playersWithRatings.length ? total / playersWithRatings.length : 0;
      return { total: total.toFixed(1), average: avg.toFixed(2) };
    };

    const ratings = calculateTeamRatings();

    return (
      <Stack>
        <Stack align='center' gap='xs'>
          <Image
            src={teamId === Team.Light ? '/static/Rockets_Logo.jpg' : '/static/Beauties_Logo.jpg'}
            alt={teamId === Team.Light ? 'Rockets Logo' : 'Beauties Logo'}
            w={125}
            h={125}
            fit='contain'
            radius='md'
          />
          <Title order={4}>{TEAM_LABELS[teamId]}</Title>
        </Stack>
        {teamRegulars.map((regular) => (
          <Group key={regular.UserId} gap='sm'>
            <Link to={`/profile/${regular.UserId}`}>
              <Avatar
                src={avatars[regular.UserId]}
                alt={`${regular.User?.FirstName} ${regular.User?.LastName}`}
                size={24}
                radius='xl'
              />
            </Link>
            <Text key={regular.UserId}>
              {regular.User?.FirstName} {regular.User?.LastName},{' '}
              {getPositionString(regular.PositionPreference)}
              {canViewRatings() &&
                showRatings &&
                regular.User?.Rating !== undefined &&
                regular.User.Rating !== null &&
                `, ${regular.User.Rating.toFixed(1)}`}
            </Text>
          </Group>
        ))}
        {canViewRatings() && showRatings && (
          <Text size='lg' fw={700} mt='xs'>
            Total: {ratings.total}, Average: {ratings.average}
          </Text>
        )}
      </Stack>
    );
  };

  const handleDuplicate = async (): Promise<void> => {
    if (!selectedPreset) return;

    try {
      const regularSetId = parseInt(selectedPreset);
      const sourceDescription = data?.RegularSets?.find(
        (set) => set.RegularSetId.toString() === selectedPreset,
      )?.Description;
      const response = await regularService.duplicateRegularSet(
        regularSetId,
        `${sourceDescription} - Copy`,
      );

      if (response.Data?.RegularSetId) {
        // Refetch the regular sets to update the dropdown
        await refetch();

        // Select the new regular set
        setSelectedPreset(response.Data.RegularSetId.toString());

        notifications.show({
          position: 'top-center',
          autoClose: 5000,
          style: { marginTop: '60px' },
          title: 'Success',
          message: 'Regular set duplicated successfully',
          color: 'green',
        });
      }
    } catch (error) {
      console.error('Failed to duplicate regular set:', error);
      notifications.show({
        position: 'top-center',
        autoClose: 5000,
        style: { marginTop: '60px' },
        title: 'Error',
        message: 'Failed to duplicate regular set',
        color: 'red',
      });
    }
  };

  const getDayOfWeek = (dayNumber: number): string => {
    return moment.weekdays(dayNumber);
  };

  return (
    <Container size='sm' px='lg'>
      <Paper withBorder shadow='md' p={30} radius='md'>
        <Title order={2} mb='xl'>
          Regular Rosters
        </Title>

        <Stack>
          <Group justify='space-between' align='flex-start'>
            <Stack style={{ flex: 1 }} gap='xs'>
              <Select
                label='Select Regular Set'
                placeholder='Choose a regular set'
                data={regularSetOptions}
                value={selectedPreset}
                onChange={setSelectedPreset}
              />
              {selectedPresetData && (
                <Text size='sm' c='dimmed' ml='sm'>
                  {selectedPresetData.Description} - {getDayOfWeek(selectedPresetData.DayOfWeek)}
                </Text>
              )}
            </Stack>
            <Stack gap='xs' pt={25}>
              <Group mt='xl'>
                <Checkbox
                  label='Include Archived'
                  checked={includeArchived}
                  onChange={(event) => setIncludeArchived(event.currentTarget.checked)}
                />
                {isAdmin() && selectedPreset && (
                  <Group>
                    <Button onClick={handleDuplicate}>Duplicate</Button>
                    <Button variant='outline' onClick={() => setEditingRegularSet(true)}>
                      <Group gap='xs'>
                        <IconEdit size={16} />
                        <span>Edit</span>
                      </Group>
                    </Button>
                  </Group>
                )}
              </Group>
            </Stack>
          </Group>
          {selectedPreset && selectedPresetData && editingRegularSet ? (
            <EditRegularSetForm
              regularSet={selectedPresetData}
              onSave={handleEditComplete}
              onCancel={() => setEditingRegularSet(false)}
            />
          ) : (
            selectedPreset && (
              <Stack mt='xl'>
                <Grid>
                  <Grid.Col span={6}>
                    <TeamSection teamId={1} />
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <TeamSection teamId={2} />
                  </Grid.Col>
                </Grid>
              </Stack>
            )
          )}
        </Stack>
      </Paper>
      <Space h='sm' />
      {selectedPreset && !selectedPresetData && !editingRegularSet && (
        <Stack mt='xl'>
          <Group align='center'>
            <Button onClick={() => setShowEmails((prev) => !prev)}>
              {showEmails ? 'Hide Emails' : 'Show Emails'}
            </Button>
          </Group>
          <Collapse in={showEmails}>
            <Group align='center'>
              <Text size='sm'>Emails:</Text>
              <CopyButton value={getAllEmails()}>
                {({ copied, copy }) => (
                  <ActionIcon color={copied ? 'teal' : 'gray'} onClick={copy}>
                    {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
                  </ActionIcon>
                )}
              </CopyButton>
            </Group>
            <Text size='xs' c='dimmed' style={{ whiteSpace: 'pre-line' }}>
              {getAllEmails()}
            </Text>
          </Collapse>
        </Stack>
      )}
    </Container>
  );
};
