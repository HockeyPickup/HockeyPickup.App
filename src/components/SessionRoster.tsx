import {
  RosterPlayer2,
  SessionDetailedResponse,
  UpdateRosterPositionRequest,
  UpdateRosterTeamRequest,
} from '@/HockeyPickup.Api';
import { useAuth } from '@/lib/auth';
import { positionMap, PositionString } from '@/lib/position';
import { sessionService } from '@/lib/session';
import { AvatarService } from '@/services/avatar';
import { DragDropContext, Draggable, Droppable, DropResult } from '@hello-pangea/dnd';
import {
  ActionIcon,
  Avatar,
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
  Title,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconPencil } from '@tabler/icons-react';
import { JSX, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { LoadingSpinner } from './LoadingSpinner';
import { useRatingsVisibility } from './RatingsToggle';

interface SessionRosterProps {
  session: SessionDetailedResponse;
  onSessionUpdate: (_session: SessionDetailedResponse) => void;
}

interface PlayerCellProps {
  player: RosterPlayer2 | undefined;
  editingPlayer: { userId: string; currentPosition: string; currentTeam: number } | null;
  onEditClick: (_userId: string, _currentPosition: string, _currentTeam: number) => void;
  onPositionChange: (_userId: string, _newPosition: PositionString) => Promise<void>;
  onTeamChange: (_userId: string, _newTeam: 1 | 2) => Promise<void>;
  onClose: () => void;
}

const PlayerCell = ({
  player,
  editingPlayer,
  onEditClick,
  onPositionChange,
  onTeamChange,
  onClose,
}: PlayerCellProps): JSX.Element | null => {
  const { isAdmin, canViewRatings } = useAuth();
  const { showRatings } = useRatingsVisibility();
  const [isSaving, setIsSaving] = useState(false);
  const [checkedPosition, setCheckedPosition] = useState<PositionString>(
    (player?.CurrentPosition as PositionString) ?? 'TBD',
  );
  const [checkedTeam, setCheckedTeam] = useState<1 | 2>((player?.TeamAssignment as 1 | 2) ?? 1);
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  useEffect(() => {
    const loadAvatar = async (): Promise<void> => {
      if (player?.Email) {
        const url = await AvatarService.getAvatarUrl(
          player.Email,
          `${player.FirstName} ${player.LastName}`,
          {
            size: 24,
            fallbackType: 'initials',
          },
        );
        setAvatarUrl(url);
      }
    };
    loadAvatar();
  }, [player?.Email]);

  const handlePositionChange = async (newPosition: PositionString): Promise<void> => {
    setIsSaving(true);
    try {
      await onPositionChange(editingPlayer?.userId ?? '', newPosition);
    } finally {
      setIsSaving(false);
      onClose();
    }
  };

  const handleTeamChange = async (newTeam: 1 | 2): Promise<void> => {
    setIsSaving(true);
    try {
      await onTeamChange(editingPlayer?.userId ?? '', newTeam);
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
          size={24}
          radius='xl'
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
      >
        {player.FirstName} {player.LastName}, {player.CurrentPosition}
        {canViewRatings() &&
          showRatings &&
          player.Rating !== undefined &&
          player.Rating !== null &&
          `, ${player.Rating.toFixed(1)}`}
      </Text>
      {isAdmin() && (
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
                    player.CurrentPosition ?? 'TBD',
                    player.TeamAssignment,
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
                <Text size='sm' fw={500}>
                  Position
                </Text>
                <Radio.Group
                  value={checkedPosition}
                  onChange={(value: string) => {
                    const newPosition = value as PositionString;
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
                    const newTeam = parseInt(value) as 1 | 2;
                    setCheckedTeam(newTeam);
                    handleTeamChange(newTeam);
                  }}
                >
                  <Stack>
                    <Radio value='1' label='Rockets (Light)' disabled={isSaving} />
                    <Radio value='2' label='Beauties (Dark)' disabled={isSaving} />
                  </Stack>
                </Radio.Group>
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
    currentPosition: string;
    currentTeam: number;
  } | null>(null);
  const { canViewRatings } = useAuth();
  const { showRatings } = useRatingsVisibility();
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnd = async (result: DropResult): Promise<void> => {
    if (!result.destination) return;

    const sourceTeam = parseInt(result.source.droppableId);
    const destinationTeam = parseInt(result.destination.droppableId);

    if (sourceTeam === destinationTeam) return;

    const playerId = result.draggableId;
    setIsDragging(true);
    try {
      await handleTeamChange(playerId, destinationTeam as 1 | 2);
    } catch (error) {
      console.error('Failed to move player:', error);
    } finally {
      setIsDragging(false);
    }
  };

  const handlePositionChange = async (
    userId: string,
    newPosition: PositionString,
  ): Promise<void> => {
    try {
      console.info('Updating position:', {
        sessionId: session.SessionId,
        userId,
        position: newPosition,
      });

      const player = session.CurrentRosters?.find((p) => p.UserId === userId);
      const currentPosition = (player?.CurrentPosition ?? 'TBD') as PositionString;

      const request: UpdateRosterPositionRequest = {
        SessionId: session.SessionId ?? 0,
        UserId: userId,
        NewPosition: positionMap[newPosition],
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

  const handleTeamChange = async (userId: string, newTeam: 1 | 2): Promise<void> => {
    try {
      console.info('Updating team:', {
        sessionId: session.SessionId,
        userId,
        team: newTeam,
      });

      const player = session.CurrentRosters?.find((p) => p.UserId === userId);
      const currentTeamName = player?.TeamAssignment === 1 ? 'Rockets (Light)' : 'Beauties (Dark)';
      const newTeamName = newTeam === 1 ? 'Rockets (Light)' : 'Beauties (Dark)';

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
              <Droppable droppableId='1'>
                {(provided) => (
                  <Stack ref={provided.innerRef} {...provided.droppableProps} mt='md' gap='xs'>
                    {session.CurrentRosters?.filter((p) => p.TeamAssignment === 1).map(
                      (player, index) => (
                        <Draggable
                          key={player.UserId}
                          draggableId={player.UserId ?? ''}
                          index={index}
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
                                  editingPlayer={editingPlayer}
                                  onEditClick={(userId, currentPosition, currentTeam) =>
                                    setEditingPlayer({ userId, currentPosition, currentTeam })
                                  }
                                  onPositionChange={handlePositionChange}
                                  onTeamChange={handleTeamChange}
                                  onClose={() => setEditingPlayer(null)}
                                />
                              </div>
                            </>
                          )}
                        </Draggable>
                      ),
                    )}
                    {provided.placeholder}
                  </Stack>
                )}
              </Droppable>
              <Text size='sm' fw={700} mt='md'>
                {
                  session.CurrentRosters?.filter((p) => p.TeamAssignment === 1 && p.IsPlaying)
                    .length
                }{' '}
                Players
              </Text>
              {canViewRatings() && showRatings && (
                <Text size='sm' fw={500}>
                  {((): string => {
                    const team = session.CurrentRosters?.filter(
                      (p) => p.TeamAssignment === 1 && p.Rating && p.IsPlaying,
                    );
                    const total = team?.reduce((sum, p) => sum + (p.Rating ?? 0), 0) ?? 0;
                    const avg = team?.length ? total / team.length : 0;
                    return `Total: ${total.toFixed(1)}, Average: ${avg.toFixed(2)}`;
                  })()}
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
              <Droppable droppableId='2'>
                {(provided) => (
                  <Stack ref={provided.innerRef} {...provided.droppableProps} mt='md' gap='xs'>
                    {session.CurrentRosters?.filter((p) => p.TeamAssignment === 2).map(
                      (player, index) => (
                        <Draggable
                          key={player.UserId}
                          draggableId={player.UserId ?? ''}
                          index={index}
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
                                  editingPlayer={editingPlayer}
                                  onEditClick={(userId, currentPosition, currentTeam) =>
                                    setEditingPlayer({ userId, currentPosition, currentTeam })
                                  }
                                  onPositionChange={handlePositionChange}
                                  onTeamChange={handleTeamChange}
                                  onClose={() => setEditingPlayer(null)}
                                />
                              </div>
                            </>
                          )}
                        </Draggable>
                      ),
                    )}
                    {provided.placeholder}
                  </Stack>
                )}
              </Droppable>
              <Text size='sm' fw={700} mt='md'>
                {
                  session.CurrentRosters?.filter((p) => p.TeamAssignment === 2 && p.IsPlaying)
                    .length
                }{' '}
                Players
              </Text>
              {canViewRatings() && showRatings && (
                <Text size='sm' fw={500}>
                  {((): string => {
                    const team = session.CurrentRosters?.filter(
                      (p) => p.TeamAssignment === 2 && p.Rating && p.IsPlaying,
                    );
                    const total = team?.reduce((sum, p) => sum + (p.Rating ?? 0), 0) ?? 0;
                    const avg = team?.length ? total / team.length : 0;
                    return `Total: ${total.toFixed(1)}, Average: ${avg.toFixed(2)}`;
                  })()}
                </Text>
              )}
            </Grid.Col>
          </Grid>
        </Stack>
      </DragDropContext>
    </Paper>
  );
};
