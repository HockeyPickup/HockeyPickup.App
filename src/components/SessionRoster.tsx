import styles from '@/App.module.css';
import {
  PlayerStatus,
  PositionPreference,
  RosterPlayer,
  SessionDetailedResponse,
  TeamAssignment,
  UpdateRosterPlayingStatusRequest,
  UpdateRosterPositionRequest,
  UpdateRosterTeamRequest,
} from '@/HockeyPickup.Api';
import { useAuth } from '@/lib/auth';
import { sessionService } from '@/lib/session';
import { AvatarService } from '@/services/avatar';
import { DragDropContext, Draggable, Droppable, DropResult } from '@hello-pangea/dnd';
import {
  ActionIcon,
  Avatar,
  Button,
  Divider,
  Grid,
  Group,
  Image,
  LoadingOverlay,
  Paper,
  Popover,
  Radio,
  Stack,
  Text,
  Textarea,
  Title,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconPencil, IconTrash } from '@tabler/icons-react';
import { JSX, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { LoadingSpinner } from './LoadingSpinner';
import { useRatingsVisibility } from './RatingsToggle';

interface SessionRosterProps {
  session: SessionDetailedResponse;
  onSessionUpdate: (_session: SessionDetailedResponse) => void;
}

interface PlayerCellProps {
  player: RosterPlayer | undefined;
  session: SessionDetailedResponse;
  onSessionUpdate: (_session: SessionDetailedResponse) => void;
  editingPlayer: {
    userId: string;
    currentPosition: PositionPreference;
    currentTeam: TeamAssignment;
  } | null;
  onEditClick: (
    _userId: string,
    _currentPosition: PositionPreference,
    _currentTeam: TeamAssignment,
  ) => void;
  onPositionChange: (_userId: string, _newPosition: PositionPreference) => Promise<void>;
  onTeamChange: (_userId: string, _newTeam: TeamAssignment) => Promise<void>;
  onPlayingStatusChange: (_userId: string, _isPlaying: boolean, _note?: string) => Promise<void>;
  onClose: () => void;
}

const PlayerCell = ({
  player,
  session,
  onSessionUpdate,
  editingPlayer,
  onEditClick,
  onPositionChange,
  onTeamChange,
  onPlayingStatusChange,
  onClose,
}: PlayerCellProps): JSX.Element | null => {
  const { isAdmin, canViewRatings } = useAuth();
  const { showRatings } = useRatingsVisibility();
  const [isSaving, setIsSaving] = useState(false);
  const [checkedPosition, setCheckedPosition] = useState<PositionPreference>(
    (player?.Position ?? PositionPreference.TBD) as PositionPreference,
  );
  const [checkedTeam, setCheckedTeam] = useState<TeamAssignment>(
    player?.TeamAssignment ?? TeamAssignment.Light,
  );
  const [isPlaying, setIsPlaying] = useState(player?.IsPlaying ?? true);
  const [isNoteExpanded, setIsNoteExpanded] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [note, setNote] = useState('');

  useEffect(() => {
    const loadAvatar = async (): Promise<void> => {
      const url = await AvatarService.getAvatarUrl(player?.PhotoUrl);
      setAvatarUrl(url);
    };
    loadAvatar();
  }, [player?.PhotoUrl]);

  const handlePositionChange = async (newPosition: PositionPreference): Promise<void> => {
    setIsSaving(true);
    try {
      await onPositionChange(editingPlayer?.userId ?? '', newPosition);
    } finally {
      setIsSaving(false);
      onClose();
    }
  };

  const handleTeamChange = async (newTeam: TeamAssignment): Promise<void> => {
    setIsSaving(true);
    try {
      await onTeamChange(editingPlayer?.userId ?? '', newTeam);
    } finally {
      setIsSaving(false);
      onClose();
    }
  };

  const handlePlayingStatusChange = async (newStatus: boolean): Promise<void> => {
    setIsSaving(true);
    try {
      await onPlayingStatusChange(editingPlayer?.userId ?? '', newStatus, note);
    } finally {
      setIsSaving(false);
      onClose();
    }
  };

  const handleRemovePlayer = async (): Promise<void> => {
    setIsSaving(true);
    try {
      const result = await sessionService.deleteFromRoster(
        session.SessionId ?? 0,
        editingPlayer?.userId ?? '',
      );
      if (result.Data !== null && result.Data !== undefined) {
        // Update the parent's session state
        onSessionUpdate(result.Data);
      }

      notifications.show({
        position: 'top-center',
        autoClose: 5000,
        style: { marginTop: '60px' },
        title: 'Player Removed',
        message: result.Message,
        color: 'green',
      });
    } catch (error) {
      console.error('Failed to remove player:', error);
      notifications.show({
        position: 'top-center',
        autoClose: 5000,
        style: { marginTop: '60px' },
        title: 'Error',
        message: 'Failed to remove player from roster. Please try again.',
        color: 'red',
      });
    } finally {
      setIsSaving(false);
      onClose();
    }
  };

  if (!player) return null;

  return (
    <Group gap={0}>
      <Link to={`/profile/${player.UserId}`}>
        <Avatar
          src={avatarUrl}
          alt={`${player.FirstName} ${player.LastName}`}
          radius='xl'
          className={styles.rosterAvatar}
        />
      </Link>
      <Text
        size='xs'
        ml={4}
        mr={2}
        key={player.UserId}
        style={{
          textDecoration: !player.IsPlaying ? 'line-through' : 'none',
          whiteSpace: 'nowrap',
        }}
        className={styles.rosterText}
      >
        {player.FirstName} {player.LastName}, {player.CurrentPosition}
        {canViewRatings() &&
          showRatings &&
          player.Rating !== undefined &&
          player.Rating !== null &&
          `, ${player.Rating.toFixed(1)}`}
        {canViewRatings() && showRatings && player.PlayerStatus === PlayerStatus.Substitute && (
          <span style={{ color: 'yellow' }}> *</span>
        )}
      </Text>
      {isAdmin() && showRatings && (
        <Popover
          position='top'
          withArrow
          shadow='md'
          opened={editingPlayer?.userId === player.UserId}
          onClose={() => !isSaving && onClose()}
        >
          <Popover.Target>
            <ActionIcon
              size='xs'
              variant='subtle'
              onClick={() => {
                if (editingPlayer?.userId === player.UserId) {
                  !isSaving && onClose();
                } else {
                  onEditClick(
                    player.UserId ?? '',
                    player.Position ?? PositionPreference.TBD,
                    player.TeamAssignment ?? TeamAssignment.TBD,
                  );
                }
              }}
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
                <Title order={4}>
                  {player.FirstName} {player.LastName}
                </Title>
                <Text size='sm' fw={500}>
                  Position
                </Text>
                <Radio.Group
                  value={checkedPosition.toString()}
                  onChange={(value) => {
                    const newPosition = value as PositionPreference;
                    setCheckedPosition(newPosition);
                    handlePositionChange(newPosition);
                  }}
                >
                  <Stack>
                    <Radio
                      value={PositionPreference.Defense}
                      label={PositionPreference.Defense}
                      disabled={isSaving}
                    />
                    <Radio
                      value={PositionPreference.Forward}
                      label={PositionPreference.Forward}
                      disabled={isSaving}
                    />
                    <Radio
                      value={PositionPreference.TBD}
                      label={PositionPreference.TBD}
                      disabled={isSaving}
                    />
                  </Stack>
                </Radio.Group>
                <Divider my='xs' />
                <Text size='sm' fw={500}>
                  Team
                </Text>
                <Radio.Group
                  value={checkedTeam.toString()}
                  onChange={(value) => {
                    const newTeam = value as TeamAssignment;
                    setCheckedTeam(newTeam);
                    handleTeamChange(newTeam);
                  }}
                >
                  <Stack>
                    <Radio
                      value={TeamAssignment.Light}
                      label='Rockets (Light)'
                      disabled={isSaving}
                    />
                    <Radio
                      value={TeamAssignment.Dark}
                      label='Beauties (Dark)'
                      disabled={isSaving}
                    />
                  </Stack>
                </Radio.Group>
                <Divider my='xs' />
                <Text size='sm' fw={500}>
                  Playing Status
                </Text>
                <Radio.Group
                  value={isPlaying.toString()}
                  onChange={(value) => {
                    const newStatus = value === 'true';
                    setIsPlaying(newStatus);
                    handlePlayingStatusChange(newStatus);
                  }}
                >
                  <Stack>
                    <Radio value='true' label='Playing' disabled={isSaving} />
                    <Radio value='false' label='Not Playing' disabled={isSaving} />
                  </Stack>
                </Radio.Group>
                <Group justify='space-between'>
                  <Text size='sm' fw={500}>
                    Optional Note
                  </Text>
                  <Button
                    variant='subtle'
                    size='xs'
                    onClick={() => setIsNoteExpanded(!isNoteExpanded)}
                  >
                    {isNoteExpanded ? 'Hide' : 'Show'}
                  </Button>
                </Group>
                {isNoteExpanded && (
                  <Textarea
                    placeholder='Playing status note...'
                    value={note}
                    onChange={(event) => setNote(event.currentTarget.value)}
                    minRows={2}
                    maxRows={4}
                    autosize
                    disabled={isSaving}
                  />
                )}
                <Divider my='xs' />
                <Button
                  color='red'
                  variant='outline'
                  onClick={handleRemovePlayer}
                  disabled={isSaving}
                >
                  <Group gap='xs'>
                    <IconTrash size={16} />
                    <span>Remove from Session</span>
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

export const SessionRoster = ({ session, onSessionUpdate }: SessionRosterProps): JSX.Element => {
  const [editingPlayer, setEditingPlayer] = useState<{
    userId: string;
    currentPosition: PositionPreference;
    currentTeam: TeamAssignment;
  } | null>(null);
  const { canViewRatings, isAdmin } = useAuth();
  const { showRatings } = useRatingsVisibility();
  const [isDragging, setIsDragging] = useState(false);
  const isDragEnabled = isAdmin() && showRatings;

  const handleDragEnd = async (result: DropResult): Promise<void> => {
    if (!result.destination) return;

    const sourceTeam =
      result.source.droppableId === '1' ? TeamAssignment.Light : TeamAssignment.Dark;
    const destinationTeam =
      result.destination.droppableId === '1' ? TeamAssignment.Light : TeamAssignment.Dark;

    if (sourceTeam === destinationTeam) return;

    const playerId = result.draggableId;
    setIsDragging(true);
    try {
      await handleTeamChange(playerId, destinationTeam);
    } catch (error) {
      console.error('Failed to move player:', error);
    } finally {
      setIsDragging(false);
    }
  };

  const handlePositionChange = async (
    userId: string,
    newPosition: PositionPreference,
  ): Promise<void> => {
    try {
      console.info('Updating position:', {
        sessionId: session.SessionId,
        userId,
        position: newPosition,
      });

      const player = session.CurrentRosters?.find((p) => p.UserId === userId);
      const currentPosition = player?.Position ?? PositionPreference.TBD;

      const request: UpdateRosterPositionRequest = {
        SessionId: session.SessionId ?? 0,
        UserId: userId,
        NewPosition: newPosition,
      };

      var result = await sessionService.updateRosterPosition(request);
      if (result.Data !== null && result.Data !== undefined) {
        // Update the parent's session state
        onSessionUpdate(result.Data);
      }

      setEditingPlayer(null);

      notifications.show({
        position: 'top-center',
        autoClose: 5000,
        style: { marginTop: '60px' },
        title: 'Position Updated',
        message: `${player?.FirstName} ${player?.LastName} changed position from ${currentPosition} to ${newPosition}`,
        color: 'green',
      });
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
    try {
      console.info('Updating team:', {
        sessionId: session.SessionId,
        userId,
        team: newTeam,
      });

      const player = session.CurrentRosters?.find((p) => p.UserId === userId);
      const currentTeamName =
        player?.TeamAssignment === TeamAssignment.Light ? 'Rockets (Light)' : 'Beauties (Dark)';
      const newTeamName = newTeam === TeamAssignment.Light ? 'Rockets (Light)' : 'Beauties (Dark)';

      const request: UpdateRosterTeamRequest = {
        SessionId: session.SessionId ?? 0,
        UserId: userId,
        NewTeamAssignment: newTeam,
      };

      var result = await sessionService.updateRosterTeam(request);
      if (result.Data !== null && result.Data !== undefined) {
        // Update the parent's session state
        onSessionUpdate(result.Data);
      }

      setEditingPlayer(null);

      notifications.show({
        position: 'top-center',
        autoClose: 5000,
        style: { marginTop: '60px' },
        title: 'Team Updated',
        message: `${player?.FirstName} ${player?.LastName} moved from ${currentTeamName} to ${newTeamName}`,
        color: 'green',
      });
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
    }
  };

  const handlePlayingStatusChange = async (
    userId: string,
    isPlaying: boolean,
    note?: string,
  ): Promise<void> => {
    try {
      const request: UpdateRosterPlayingStatusRequest = {
        SessionId: session.SessionId ?? 0,
        UserId: userId,
        IsPlaying: isPlaying,
        Note: note,
      };

      const result = await sessionService.updateRosterPlayingStatus(request);
      if (result.Data !== null && result.Data !== undefined) {
        onSessionUpdate(result.Data);
      }

      setEditingPlayer(null);

      notifications.show({
        position: 'top-center',
        autoClose: 5000,
        style: { marginTop: '60px' },
        title: 'Playing Status Updated',
        message: `Player status updated to ${isPlaying ? 'Playing' : 'Not Playing'}`,
        color: 'green',
      });
    } catch (error) {
      console.error('Failed to update playing status:', error);
      notifications.show({
        position: 'top-center',
        autoClose: 5000,
        style: { marginTop: '60px' },
        title: 'Error',
        message: 'Failed to update playing status. Please try again.',
        color: 'red',
      });
    }
  };

  const sortRosterPlayers = (a: RosterPlayer, b: RosterPlayer): number => {
    // Sort by IsPlaying first (true comes before false)
    if (a.IsPlaying !== b.IsPlaying) {
      return a.IsPlaying ? -1 : 1;
    }
    // Then sort by Position (Defense before Forward)
    if (a.Position !== b.Position) {
      if (a.Position === PositionPreference.Defense) return -1;
      if (b.Position === PositionPreference.Defense) return 1;
      if (a.Position === PositionPreference.Forward) return -1;
      if (b.Position === PositionPreference.Forward) return 1;
    }
    // Finally sort by FirstName
    return (a.FirstName ?? '').localeCompare(b.FirstName ?? '');
  };

  return (
    <Paper shadow='sm' p='md'>
      <Title order={3} mb='md'>
        Roster - {session.RegularSet?.Description}
      </Title>
      <DragDropContext onDragEnd={handleDragEnd}>
        <Stack pos='relative'>
          <LoadingOverlay
            visible={isDragging}
            zIndex={1000}
            overlayProps={{ blur: 2 }}
            loaderProps={{ children: <LoadingSpinner medium /> }}
          />
          <Grid>
            <Grid.Col span={6}>
              <Stack align='center' gap='xs'>
                <Image
                  src='/static/Rockets_Logo.jpg'
                  alt='Rockets Logo'
                  w={125}
                  h={125}
                  fit='contain'
                  radius='md'
                />
                <Title order={4}>Rockets (Light)</Title>
              </Stack>
              <Droppable droppableId='1' isDropDisabled={!isDragEnabled}>
                {(provided) => (
                  <Stack ref={provided.innerRef} {...provided.droppableProps} mt='md' gap='xs'>
                    {session.CurrentRosters?.filter(
                      (p) => p.TeamAssignment === TeamAssignment.Light,
                    )
                      .sort(sortRosterPlayers)
                      .map((player, index) => (
                        <Draggable
                          key={`light-${player.UserId}-${index}`}
                          draggableId={player.UserId ?? ''}
                          index={index}
                          isDragDisabled={!isDragEnabled}
                        >
                          {(provided, _snapshot) => (
                            <>
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                              >
                                <Divider my={1} opacity={0.2} color='gray' />
                                <PlayerCell
                                  player={player}
                                  session={session}
                                  onSessionUpdate={onSessionUpdate}
                                  editingPlayer={editingPlayer}
                                  onEditClick={(userId, currentPosition, currentTeam) =>
                                    setEditingPlayer({ userId, currentPosition, currentTeam })
                                  }
                                  onPositionChange={handlePositionChange}
                                  onTeamChange={handleTeamChange}
                                  onPlayingStatusChange={handlePlayingStatusChange}
                                  onClose={() => setEditingPlayer(null)}
                                />
                              </div>
                            </>
                          )}
                        </Draggable>
                      ))}
                    {provided.placeholder}
                  </Stack>
                )}
              </Droppable>
              <Text size='sm' fw={700} mt='md'>
                {
                  session.CurrentRosters?.filter(
                    (p) => p.TeamAssignment === TeamAssignment.Light && p.IsPlaying,
                  ).length
                }
                &nbsp; Players
              </Text>
              {canViewRatings() && showRatings && (
                <Text size='sm' fw={500}>
                  {((): string => {
                    const team = session.CurrentRosters?.filter(
                      (p) => p.TeamAssignment === TeamAssignment.Light && p.Rating && p.IsPlaying,
                    );
                    const total = team?.reduce((sum, p) => sum + (p.Rating ?? 0), 0) ?? 0;
                    const avg = team?.length ? total / team.length : 0;
                    return `Total: ${total.toFixed(1)}, Average: ${avg.toFixed(2)}`;
                  })()}
                  <Text size='sm' c='dimmed' mt={5}>
                    <span style={{ color: 'yellow' }}> *</span> - Substitute
                  </Text>
                </Text>
              )}
            </Grid.Col>
            <div
              style={{
                width: '2px',
                backgroundColor: 'var(--mantine-color-dark-4)',
                margin: '0 -1px', // negative margin to not affect overall layout
                alignSelf: 'stretch',
                opacity: 0.5, // make it subtle
              }}
            />
            <Grid.Col span={6}>
              <Stack align='center' gap='xs'>
                <Image
                  src='/static/Beauties_Logo.jpg'
                  alt='Beauties Logo'
                  w={125}
                  h={125}
                  fit='contain'
                  radius='md'
                />
                <Title order={4}>Beauties (Dark)</Title>
              </Stack>
              <Droppable droppableId='2' isDropDisabled={!isDragEnabled}>
                {(provided) => (
                  <Stack ref={provided.innerRef} {...provided.droppableProps} mt='md' gap='xs'>
                    {session.CurrentRosters?.filter((p) => p.TeamAssignment === TeamAssignment.Dark)
                      .sort(sortRosterPlayers)
                      .map((player, index) => (
                        <Draggable
                          key={`dark-${player.UserId}-${index}`}
                          draggableId={player.UserId ?? ''}
                          index={index}
                          isDragDisabled={!isDragEnabled}
                        >
                          {(provided, _snapshot) => (
                            <>
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                              >
                                <Divider my={1} opacity={0.2} color='gray' />
                                <PlayerCell
                                  player={player}
                                  session={session}
                                  onSessionUpdate={onSessionUpdate}
                                  editingPlayer={editingPlayer}
                                  onEditClick={(userId, currentPosition, currentTeam) =>
                                    setEditingPlayer({ userId, currentPosition, currentTeam })
                                  }
                                  onPositionChange={handlePositionChange}
                                  onTeamChange={handleTeamChange}
                                  onPlayingStatusChange={handlePlayingStatusChange}
                                  onClose={() => setEditingPlayer(null)}
                                />
                              </div>
                            </>
                          )}
                        </Draggable>
                      ))}
                    {provided.placeholder}
                  </Stack>
                )}
              </Droppable>
              <Text size='sm' fw={700} mt='md'>
                {
                  session.CurrentRosters?.filter(
                    (p) => p.TeamAssignment === TeamAssignment.Dark && p.IsPlaying,
                  ).length
                }
                &nbsp; Players
              </Text>
              {canViewRatings() && showRatings && (
                <Text size='sm' fw={500}>
                  {((): string => {
                    const team = session.CurrentRosters?.filter(
                      (p) => p.TeamAssignment === TeamAssignment.Dark && p.Rating && p.IsPlaying,
                    );
                    const total = team?.reduce((sum, p) => sum + (p.Rating ?? 0), 0) ?? 0;
                    const avg = team?.length ? total / team.length : 0;
                    return `Total: ${total.toFixed(1)}, Average: ${avg.toFixed(2)}`;
                  })()}
                  <Text size='sm' c='dimmed' mt={5}>
                    <span style={{ color: 'yellow' }}> *</span> - Substitute
                  </Text>
                </Text>
              )}
            </Grid.Col>
          </Grid>
        </Stack>
      </DragDropContext>
    </Paper>
  );
};
