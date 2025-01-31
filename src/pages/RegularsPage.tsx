import { EmailList } from '@/components/EmailList';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useRatingsVisibility } from '@/components/RatingsToggle';
import { RegularSetSelect } from '@/components/RegularSetSelect';
import {
  PositionPreference,
  RegularDetailedResponse,
  RegularSetDetailedResponse,
  TeamAssignment,
  User,
} from '@/HockeyPickup.Api';
import { useTitle } from '@/layouts/TitleContext';
import { useAuth } from '@/lib/auth';
import { GET_REGULARSETS, GET_USERS } from '@/lib/queries';
import { regularService } from '@/lib/regular';
import { AvatarService } from '@/services/avatar';
import { useQuery } from '@apollo/client';
import { DragDropContext, Draggable, Droppable, DropResult } from '@hello-pangea/dnd';
import {
  ActionIcon,
  Avatar,
  Button,
  Checkbox,
  Container,
  Divider,
  Grid,
  Group,
  Image,
  LoadingOverlay,
  Modal,
  Paper,
  Popover,
  Radio,
  Select,
  Space,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { IconEdit, IconPencil, IconPlus, IconTrash } from '@tabler/icons-react';
import { JSX, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

// For editing - only actual days
const editDayOptions = [
  { value: '0', label: 'Sunday' },
  { value: '1', label: 'Monday' },
  { value: '2', label: 'Tuesday' },
  { value: '3', label: 'Wednesday' },
  { value: '4', label: 'Thursday' },
  { value: '5', label: 'Friday' },
  { value: '6', label: 'Saturday' },
];

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
          data={editDayOptions}
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

const NewRegularSetForm = ({
  onSave,
  onCancel,
}: {
  onSave: () => void;
  onCancel: () => void;
}): JSX.Element => {
  const form = useForm({
    initialValues: {
      description: '',
      dayOfWeek: 0,
      archived: false,
    },
  });

  const handleSubmit = async (values: typeof form.values): Promise<void> => {
    try {
      await regularService.createRegularSet({
        Description: values.description,
        DayOfWeek: values.dayOfWeek,
      });

      notifications.show({
        position: 'top-center',
        autoClose: 5000,
        style: { marginTop: '60px' },
        title: 'Success',
        message: 'Regular set created successfully',
        color: 'green',
      });

      onSave();
    } catch (error) {
      console.error('Failed to create regular set:', error);
      const errorMessage =
        (error as { response?: { data: { Message: string } } }).response?.data?.Message ??
        'Failed to create regular set';
      notifications.show({
        position: 'top-center',
        autoClose: 5000,
        style: { marginTop: '60px' },
        title: 'Error',
        message: errorMessage,
        color: 'red',
      });
    }
  };

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
          data={editDayOptions}
          value={form.values.dayOfWeek.toString()}
          onChange={(value) => form.setFieldValue('dayOfWeek', parseInt(value ?? '0'))}
        />
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
  const { setPageInfo } = useTitle();
  const { isAdmin, canViewRatings } = useAuth();
  const { showRatings } = useRatingsVisibility();
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [editingRegularSet, setEditingRegularSet] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState(false);
  const [addModalOpened, setAddModalOpened] = useState(false);
  const [creatingRegularSet, setCreatingRegularSet] = useState(false);

  const { loading, data, refetch } = useQuery<{ RegularSets: RegularSetDetailedResponse[] }>(
    GET_REGULARSETS,
  );

  useEffect(() => {
    setPageInfo('Regulars', 'Hockey Pickup Regulars');
  }, [setPageInfo]);

  if (loading) return <LoadingSpinner />;

  const selectedPresetData = data?.RegularSets?.find(
    (set) => set.RegularSetId.toString() === selectedPreset,
  );

  const handleEditComplete = async (): Promise<void> => {
    setEditingRegularSet(false);
    await refetch();
  };

  const getTeamRegulars = (team: TeamAssignment): RegularDetailedResponse[] => {
    return (
      selectedPresetData?.Regulars?.filter((regular) => {
        return (
          (regular.TeamAssignment as unknown as string) ===
          (team === TeamAssignment.Light ? 'Light' : 'Dark')
        );
      }).sort((a, b) => {
        if (a.PositionPreference !== b.PositionPreference) {
          // Defense sorts before Forward
          return a.PositionPreference === 'Defense' ? -1 : 1;
        }
        return (a.User?.FirstName ?? '').localeCompare(b.User?.FirstName ?? '');
      }) ?? []
    );
  };

  const getTeamEmails = (team: TeamAssignment): string[] => {
    return getTeamRegulars(team)
      .map((regular) => regular.User?.Email)
      .filter(Boolean) as string[];
  };

  const getAllEmails = (): string => {
    const lightEmails = getTeamEmails(TeamAssignment.Light);
    const darkEmails = getTeamEmails(TeamAssignment.Dark);
    return [...lightEmails, ...darkEmails].sort((a, b) => a.localeCompare(b)).join('\n');
  };

  const handlePositionChange = async (
    userId: string,
    newPosition: PositionPreference,
  ): Promise<void> => {
    try {
      if (!selectedPreset) return;

      const player = data?.RegularSets?.find(
        (set) => set.RegularSetId.toString() === selectedPreset,
      )?.Regulars?.find((p) => p.UserId === userId);

      const currentPosition = player?.PositionPreference ?? PositionPreference.TBD;

      const result = await regularService.updateRegularPosition({
        RegularSetId: parseInt(selectedPreset),
        UserId: userId,
        NewPosition: newPosition,
      });

      if (result.Data) {
        await refetch();
        notifications.show({
          position: 'top-center',
          autoClose: 5000,
          style: { marginTop: '60px' },
          title: 'Position Updated',
          message: `${player?.User?.FirstName} ${player?.User?.LastName} changed position from ${currentPosition} to ${newPosition}`,
          color: 'green',
        });
      }
    } catch (error) {
      console.error('Failed to update position:', error);
      notifications.show({
        position: 'top-center',
        autoClose: 5000,
        style: { marginTop: '60px' },
        title: 'Error',
        message: 'Failed to update player position. Please try again.',
        color: 'red',
      });
    }
  };

  const handleTeamChange = async (userId: string, newTeam: TeamAssignment): Promise<void> => {
    setIsDragging(true);
    try {
      if (!selectedPreset) return;

      const player = data?.RegularSets?.find(
        (set) => set.RegularSetId.toString() === selectedPreset,
      )?.Regulars?.find((p) => p.UserId === userId);

      const currentTeamName =
        (player?.TeamAssignment as unknown as string) === 'Light'
          ? 'Rockets (Light)'
          : 'Beauties (Dark)';
      const newTeamName = newTeam === TeamAssignment.Light ? 'Rockets (Light)' : 'Beauties (Dark)';
      const result = await regularService.updateRegularTeam({
        RegularSetId: parseInt(selectedPreset),
        UserId: userId,
        NewTeamAssignment: newTeam,
      });

      if (result.Data) {
        await refetch();
        notifications.show({
          position: 'top-center',
          autoClose: 5000,
          style: { marginTop: '60px' },
          title: 'Team Updated',
          message: `${player?.User?.FirstName} ${player?.User?.LastName} moved from ${currentTeamName} to ${newTeamName}`,
          color: 'green',
        });
      }
    } catch (error) {
      console.error('Failed to update team:', error);
      notifications.show({
        position: 'top-center',
        autoClose: 5000,
        style: { marginTop: '60px' },
        title: 'Error',
        message: 'Failed to update player team. Please try again.',
        color: 'red',
      });
    } finally {
      setIsDragging(false);
    }
  };

  const handleDragEnd = async (result: DropResult): Promise<void> => {
    if (!result.destination || !selectedPreset) return;

    const sourceTeam = result.source.droppableId.split('-')[1] as TeamAssignment;
    const destinationTeam = result.destination.droppableId.split('-')[1] as TeamAssignment;

    if (sourceTeam === destinationTeam) return;

    const playerId = result.draggableId;
    try {
      await handleTeamChange(playerId, destinationTeam);
    } catch (error) {
      console.error('Failed to move player:', error);
    }
  };

  const TeamSection = ({ team }: { team: TeamAssignment }): JSX.Element => {
    const teamRegulars = getTeamRegulars(team);
    const [avatars, setAvatars] = useState<Record<string, string>>({});
    const teamRegularsKey = teamRegulars
      .map((regular) => regular.UserId)
      .sort()
      .join(',');

    useEffect(() => {
      const loadAvatars = async (): Promise<void> => {
        const newAvatars: Record<string, string> = {};
        for (const regular of teamRegulars) {
          const avatarUrl = await AvatarService.getAvatarUrl(regular.User?.PhotoUrl ?? '');
          newAvatars[regular.UserId] = avatarUrl;
        }
        setAvatars(newAvatars);
      };
      loadAvatars();
    }, [teamRegularsKey]);

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

    const PlayerRow = ({
      regular,
      onPositionChange,
      onTeamChange,
    }: {
      regular: RegularDetailedResponse;
      onPositionChange: (_userId: string, _newPosition: PositionPreference) => Promise<void>;
      onTeamChange: (_userId: string, _newTeam: TeamAssignment) => Promise<void>;
    }): JSX.Element => {
      const { isAdmin, canViewRatings } = useAuth();
      const { showRatings } = useRatingsVisibility();
      const [editingPlayer, setEditingPlayer] = useState(false);
      const [isSaving, setIsSaving] = useState(false);
      const [checkedPosition, setCheckedPosition] = useState<PositionPreference>(
        (regular?.PositionPreference ?? PositionPreference.TBD) as PositionPreference,
      );
      const [checkedTeam, setCheckedTeam] = useState<TeamAssignment>(regular.TeamAssignment);
      const handlePositionChange = async (newPosition: PositionPreference): Promise<void> => {
        setIsSaving(true);
        try {
          await onPositionChange(regular.UserId, newPosition);
        } finally {
          setIsSaving(false);
          setEditingPlayer(false);
        }
      };

      const handleTeamChange = async (newTeam: TeamAssignment): Promise<void> => {
        setIsSaving(true);
        try {
          await onTeamChange(regular.UserId, newTeam);
        } finally {
          setIsSaving(false);
          setEditingPlayer(false);
        }
      };

      const handleDeleteRegular = async (): Promise<void> => {
        setIsSaving(true);
        try {
          if (!selectedPreset) return;
          await regularService.deleteRegular(parseInt(selectedPreset), regular.UserId);
          await refetch();
          notifications.show({
            position: 'top-center',
            autoClose: 5000,
            style: { marginTop: '60px' },
            title: 'Success',
            message: `${regular.User?.FirstName} ${regular.User?.LastName} removed from regular set`,
            color: 'green',
          });
        } catch (error) {
          console.error('Failed to delete regular:', error);
          const errorMessage =
            (error as { response?: { data: { Message: string } } }).response?.data?.Message ??
            'Failed to remove regular from regular set';
          notifications.show({
            position: 'top-center',
            autoClose: 5000,
            style: { marginTop: '60px' },
            title: 'Error',
            message: errorMessage,
            color: 'red',
          });
        } finally {
          setIsSaving(false);
          setEditingPlayer(false);
        }
      };

      return (
        <Group gap={2} mb={10}>
          <Link to={`/profile/${regular.UserId}`}>
            <Avatar
              src={avatars[regular.UserId]}
              alt={`${regular.User?.FirstName} ${regular.User?.LastName}`}
              size={36}
              radius='xl'
            />
          </Link>
          <Text size='xs' ml={4} mr={2} key={regular.UserId}>
            {regular.User?.FirstName} {regular.User?.LastName},{' '}
            {regular.PositionPreference as unknown as string}
            {canViewRatings() &&
              showRatings &&
              regular.User?.Rating !== undefined &&
              regular.User.Rating !== null &&
              `, ${regular.User.Rating.toFixed(1)}`}
          </Text>
          {isAdmin() && showRatings && (
            <Popover
              position='top'
              withArrow
              shadow='md'
              opened={editingPlayer}
              onClose={() => !isSaving && setEditingPlayer(false)}
            >
              <Popover.Target>
                <ActionIcon
                  size='xs'
                  variant='subtle'
                  onClick={() => setEditingPlayer((prev) => !prev)}
                  disabled={isSaving}
                >
                  <IconPencil size={16} />
                </ActionIcon>
              </Popover.Target>
              <Popover.Dropdown>
                <Paper pos='relative'>
                  <LoadingOverlay
                    visible={isSaving}
                    zIndex={1000}
                    overlayProps={{ blur: 2 }}
                    loaderProps={{ children: <LoadingSpinner mini /> }}
                  />
                  <Stack>
                    <Text size='sm' fw={500}>
                      Position
                    </Text>
                    <Radio.Group
                      value={checkedPosition.toString()}
                      onChange={(value: string) => {
                        const newPosition = value as PositionPreference;
                        setCheckedPosition(newPosition);
                        handlePositionChange(newPosition);
                      }}
                    >
                      <Stack>
                        <Radio value='Defense' label='Defense' disabled={isSaving} />
                        <Radio value='Forward' label='Forward' disabled={isSaving} />
                        <Radio value='TBD' label='TBD' disabled={isSaving} />
                      </Stack>
                    </Radio.Group>
                    <Divider my='xs' />
                    <Text size='sm' fw={500}>
                      Team
                    </Text>
                    <Radio.Group
                      value={checkedTeam.toString()}
                      onChange={(value: string) => {
                        const newTeam = value as TeamAssignment;
                        setCheckedTeam(newTeam);
                        handleTeamChange(newTeam);
                      }}
                    >
                      <Stack>
                        <Radio value='Light' label='Rockets (Light)' disabled={isSaving} />
                        <Radio value='Dark' label='Beauties (Dark)' disabled={isSaving} />
                      </Stack>
                    </Radio.Group>
                    <Button
                      color='red'
                      variant='outline'
                      onClick={handleDeleteRegular}
                      disabled={isSaving}
                    >
                      <Group gap='xs'>
                        <IconTrash size={16} />
                        <span>Remove from Regular Set</span>
                      </Group>
                    </Button>
                  </Stack>
                </Paper>
              </Popover.Dropdown>
            </Popover>
          )}
        </Group>
      );
    };

    return (
      <Stack>
        <Stack align='center' gap='xs'>
          <Image
            src={team === 'Light' ? '/static/Rockets_Logo.jpg' : '/static/Beauties_Logo.jpg'}
            alt={team === 'Light' ? 'Rockets Logo' : 'Beauties Logo'}
            w={125}
            h={125}
            fit='contain'
            radius='md'
          />
          <Title order={4}>{team === 'Light' ? 'Rockets (Light)' : 'Beauties (Dark)'}</Title>
        </Stack>
        <Droppable droppableId={`team-${team.toString()}`}>
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              style={{
                minHeight: '50px',
                ...(teamRegulars.length === 0 && {
                  border: '2px dashed var(--mantine-color-gray-4)',
                  borderRadius: '8px',
                  padding: '8px',
                }),
              }}
            >
              {teamRegulars.map((regular, index) => (
                <Draggable key={regular.UserId} draggableId={regular.UserId} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      style={{
                        ...provided.draggableProps.style,
                        opacity: snapshot.isDragging ? 0.5 : 1,
                      }}
                    >
                      <Divider my={1} opacity={0.2} color='gray' />
                      <PlayerRow
                        regular={regular}
                        onPositionChange={handlePositionChange}
                        onTeamChange={handleTeamChange}
                      />
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
        <Text size='lg' fw={700}>
          {teamRegulars.length} {teamRegulars.length === 1 ? 'Player' : 'Players'}
        </Text>
        {canViewRatings() && showRatings && (
          <Text size='sm' fw={500}>
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

  const handleDelete = async (): Promise<void> => {
    if (!selectedPreset) return;

    modals.openConfirmModal({
      title: 'Delete Regular Set',
      centered: true,
      children: (
        <Text size='sm'>
          Are you sure you want to delete this regular set? This action cannot be undone.
        </Text>
      ),
      labels: { confirm: 'Delete', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        try {
          await regularService.deleteRegularSet(parseInt(selectedPreset));
          await refetch();
          setSelectedPreset(null);

          notifications.show({
            position: 'top-center',
            autoClose: 5000,
            style: { marginTop: '60px' },
            title: 'Success',
            message: 'Regular set deleted successfully',
            color: 'green',
          });
        } catch (error) {
          console.error('Failed to delete regular set:', error);
          const errorMessage =
            (error as { response?: { data: { Message: string } } }).response?.data?.Message ??
            'Failed to delete regular set';
          notifications.show({
            position: 'top-center',
            autoClose: 5000,
            style: { marginTop: '60px' },
            title: 'Error',
            message: errorMessage,
            color: 'red',
          });
        }
      },
    });
  };

  const AddRegularModal = ({
    opened,
    onClose,
    regularSetId,
    existingRegulars,
  }: {
    opened: boolean;
    onClose: () => void;
    regularSetId: number;
    existingRegulars: RegularDetailedResponse[];
  }): JSX.Element => {
    const [loading, setLoading] = useState(false);
    const form = useForm({
      initialValues: {
        userId: '',
        position: PositionPreference.TBD,
        team: TeamAssignment.Light,
      },
    });

    const { data: allUsers } = useQuery(GET_USERS); // Use existing GET_USERS query

    const availableUsers =
      allUsers?.UsersEx?.filter(
        (user: User) =>
          user.Active && // Only active users
          !existingRegulars.some((regular) => regular.UserId === user.Id),
      ).sort((a: User, b: User) => (a.FirstName ?? '').localeCompare(b.FirstName ?? '')) ?? [];

    const handleSubmit = async (values: typeof form.values): Promise<void> => {
      setLoading(true);
      try {
        await regularService.addRegular({
          RegularSetId: regularSetId,
          UserId: values.userId,
          PositionPreference: values.position,
          TeamAssignment: values.team,
        });

        await refetch();
        notifications.show({
          position: 'top-center',
          autoClose: 5000,
          style: { marginTop: '60px' },
          title: 'Success',
          message: 'Player added to regular set',
          color: 'green',
        });
        onClose();
      } catch (error) {
        console.error('Failed to add regular:', error);
        notifications.show({
          position: 'top-center',
          autoClose: 5000,
          style: { marginTop: '60px' },
          title: 'Error',
          message: 'Failed to add player to regular set',
          color: 'red',
        });
      } finally {
        setLoading(false);
      }
    };

    return (
      <Modal opened={opened} onClose={onClose} title='Add Regular Player' centered>
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack>
            <Select
              label='Player'
              placeholder='Select player'
              data={availableUsers.map((user: User) => ({
                value: user.Id,
                label: `${user.FirstName} ${user.LastName}`,
              }))}
              searchable
              {...form.getInputProps('userId')}
            />
            <Radio.Group label='Position' {...form.getInputProps('position')}>
              <Stack>
                <Radio value={PositionPreference.Defense} label='Defense' />
                <Radio value={PositionPreference.Forward} label='Forward' />
                <Radio value={PositionPreference.TBD} label='TBD' />
              </Stack>
            </Radio.Group>
            <Radio.Group label='Team' {...form.getInputProps('team')}>
              <Stack>
                <Radio value={TeamAssignment.Light} label='Rockets (Light)' />
                <Radio value={TeamAssignment.Dark} label='Beauties (Dark)' />
              </Stack>
            </Radio.Group>
            <Group justify='flex-end' mt='md'>
              <Button variant='outline' onClick={onClose}>
                Cancel
              </Button>
              <Button type='submit' loading={loading}>
                Add Player
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    );
  };

  return (
    <Container size='sm' px='lg' mb='xl'>
      <Paper withBorder shadow='md' p={30} radius='md'>
        <Group justify='space-between' mb='xl'>
          <Title order={2}>Regular Rosters</Title>
          {isAdmin() && showRatings && (
            <Button onClick={() => setCreatingRegularSet(true)}>
              <Group gap='xs'>
                <IconPlus size={16} />
                <span>New Regular Set</span>
              </Group>
            </Button>
          )}
        </Group>
        <Stack>
          <Stack style={{ flex: 1 }} gap='xs'>
            <Group align='flex-start'>
              <Stack style={{ flex: 1 }} gap='xs'>
                <RegularSetSelect
                  value={selectedPreset}
                  onChange={setSelectedPreset}
                  defaultIncludeArchived={false}
                />
              </Stack>
            </Group>

            {isAdmin() && selectedPreset && showRatings && (
              <Group>
                <Button color='red' onClick={handleDelete}>
                  <Group gap='xs'>
                    <IconTrash size={16} />
                    <span>Delete</span>
                  </Group>
                </Button>
                <Button onClick={handleDuplicate}>Duplicate</Button>
                <Button variant='outline' onClick={() => setEditingRegularSet(true)}>
                  <Group gap='xs'>
                    <IconEdit size={16} />
                    <span>Edit</span>
                  </Group>
                </Button>
              </Group>
            )}
          </Stack>

          {selectedPreset && selectedPresetData && editingRegularSet ? (
            <EditRegularSetForm
              regularSet={selectedPresetData}
              onSave={handleEditComplete}
              onCancel={() => setEditingRegularSet(false)}
            />
          ) : creatingRegularSet ? (
            <NewRegularSetForm
              onSave={async () => {
                setCreatingRegularSet(false);
                await refetch();
              }}
              onCancel={() => setCreatingRegularSet(false)}
            />
          ) : (
            selectedPreset && (
              <DragDropContext onDragEnd={handleDragEnd}>
                <Stack mt='xl' pos='relative'>
                  <LoadingOverlay
                    visible={isDragging}
                    zIndex={1000}
                    overlayProps={{ blur: 2 }}
                    loaderProps={{ children: <LoadingSpinner medium /> }}
                  />
                  <Grid>
                    <Grid.Col span={6}>
                      <TeamSection team={TeamAssignment.Light} />
                    </Grid.Col>
                    <div
                      style={{
                        width: '2px',
                        backgroundColor: 'var(--mantine-color-dark-4)',
                        margin: '0 -1px', // negative margin to not affect overall layout
                        alignSelf: 'stretch',
                        opacity: 0.5, // make it subtle
                      }}
                    />{' '}
                    <Grid.Col span={6}>
                      <TeamSection team={TeamAssignment.Dark} />
                    </Grid.Col>
                  </Grid>
                </Stack>
              </DragDropContext>
            )
          )}
        </Stack>
      </Paper>
      <Space h='sm' />
      {selectedPreset && selectedPresetData && !editingRegularSet && showRatings && (
        <>
          <Button onClick={() => setAddModalOpened(true)} mb='md'>
            Add Regular Player
          </Button>
          <AddRegularModal
            opened={addModalOpened}
            onClose={() => setAddModalOpened(false)}
            regularSetId={parseInt(selectedPreset)}
            existingRegulars={selectedPresetData.Regulars ?? []}
          />
        </>
      )}
      {selectedPreset && selectedPresetData && !editingRegularSet && (
        <>
          <EmailList getEmails={getAllEmails} />
        </>
      )}
    </Container>
  );
};
