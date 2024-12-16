import {
  RosterPlayer2,
  SessionDetailedResponse,
  UpdateRosterPositionRequest,
  UpdateRosterTeamRequest,
} from '@/HockeyPickup.Api';
import { useAuth } from '@/lib/auth';
import { positionMap, PositionString } from '@/lib/position';
import { sessionService } from '@/lib/session';
import {
  ActionIcon,
  Divider,
  Group,
  Image,
  Paper,
  Popover,
  Radio,
  Stack,
  Table,
  Text,
  Title,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconPencil } from '@tabler/icons-react';
import { JSX, useState } from 'react';
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
  const [checkedPosition, setCheckedPosition] = useState<PositionString>(
    (editingPlayer?.currentPosition as PositionString) ?? 'TBD',
  );
  const [checkedTeam, setCheckedTeam] = useState<1 | 2>((player?.TeamAssignment as 1 | 2) ?? 1);

  if (!player) return null;

  return (
    <Group wrap='nowrap' gap={4} style={{ marginLeft: -4 }}>
      <Text
        size='xs'
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
          onClose={onClose}
        >
          <Popover.Target>
            <ActionIcon
              size='xs'
              variant='subtle'
              onClick={() => {
                if (editingPlayer?.userId === player.UserId) {
                  onClose(); // If already open, close it
                } else {
                  onEditClick(
                    player.UserId ?? '',
                    player.CurrentPosition ?? 'TBD',
                    player.TeamAssignment,
                  ); // If closed, open it
                  setCheckedPosition((player.CurrentPosition ?? 'TBD') as PositionString);
                  setCheckedTeam((player.TeamAssignment as 1 | 2) ?? 1);
                }
              }}
            >
              <IconPencil size={16} />
            </ActionIcon>
          </Popover.Target>
          <Popover.Dropdown>
            <Stack>
              <Text size='sm' fw={500}>
                Position
              </Text>
              <Radio.Group
                value={checkedPosition}
                onChange={(value: string) => {
                  const newPosition = value as PositionString;
                  setCheckedPosition(newPosition);
                  setTimeout(() => {
                    onPositionChange(editingPlayer?.userId ?? '', newPosition);
                  }, 100);
                }}
              >
                <Stack>
                  <Radio value='Defense' label='Defense' checked={checkedPosition === 'Defense'} />
                  <Radio value='Forward' label='Forward' checked={checkedPosition === 'Forward'} />
                  <Radio value='TBD' label='TBD' checked={checkedPosition === 'TBD'} />
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
                  setTimeout(() => {
                    onTeamChange(editingPlayer?.userId ?? '', newTeam);
                  }, 100);
                }}
              >
                <Stack>
                  <Radio value='1' label='Rockets (Light)' checked={checkedTeam === 1} />
                  <Radio value='2' label='Beauties (Dark)' checked={checkedTeam === 2} />
                </Stack>
              </Radio.Group>
            </Stack>
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
      <Table striped highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>
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
            </Table.Th>
            <Table.Th>
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
            </Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {Array.from({
            length: Math.max(
              session.CurrentRosters?.filter((p) => p.TeamAssignment === 1).length ?? 0,
              session.CurrentRosters?.filter((p) => p.TeamAssignment === 2).length ?? 0,
            ),
          }).map((_, index) => {
            const lightPlayer = session.CurrentRosters?.filter((p) => p.TeamAssignment === 1)[
              index
            ];
            const darkPlayer = session.CurrentRosters?.filter((p) => p.TeamAssignment === 2)[index];

            return (
              <Table.Tr key={index}>
                <Table.Td>
                  <PlayerCell
                    player={lightPlayer}
                    editingPlayer={editingPlayer}
                    onEditClick={(userId, currentPosition, currentTeam) =>
                      setEditingPlayer({ userId, currentPosition, currentTeam })
                    }
                    onPositionChange={handlePositionChange}
                    onTeamChange={handleTeamChange}
                    onClose={() => setEditingPlayer(null)}
                  />
                </Table.Td>
                <Table.Td>
                  <PlayerCell
                    player={darkPlayer}
                    editingPlayer={editingPlayer}
                    onEditClick={(userId, currentPosition, currentTeam) =>
                      setEditingPlayer({ userId, currentPosition, currentTeam })
                    }
                    onPositionChange={handlePositionChange}
                    onTeamChange={handleTeamChange}
                    onClose={() => setEditingPlayer(null)}
                  />
                </Table.Td>
              </Table.Tr>
            );
          })}
          <Table.Tr>
            <Table.Td>
              <Text size='sm' fw={700}>
                {
                  session.CurrentRosters?.filter((p) => p.TeamAssignment === 1 && p.IsPlaying)
                    .length
                }{' '}
                Players
              </Text>
            </Table.Td>
            <Table.Td>
              <Text size='sm' fw={700}>
                {
                  session.CurrentRosters?.filter((p) => p.TeamAssignment === 2 && p.IsPlaying)
                    .length
                }{' '}
                Players
              </Text>
            </Table.Td>
          </Table.Tr>
          {canViewRatings() && showRatings && (
            <Table.Tr>
              <Table.Td>
                {((): JSX.Element => {
                  const lightTeam = session.CurrentRosters?.filter(
                    (p) => p.TeamAssignment === 1 && p.Rating && p.IsPlaying,
                  );
                  const total = lightTeam?.reduce((sum, p) => sum + (p.Rating ?? 0), 0) ?? 0;
                  const avg = lightTeam?.length ? total / lightTeam.length : 0;
                  return (
                    <Text size='sm' fw={500}>
                      Total: {total.toFixed(1)}, Average: {avg.toFixed(2)}
                    </Text>
                  );
                })()}
              </Table.Td>
              <Table.Td>
                {((): JSX.Element => {
                  const darkTeam = session.CurrentRosters?.filter(
                    (p) => p.TeamAssignment === 2 && p.Rating && p.IsPlaying,
                  );
                  const total = darkTeam?.reduce((sum, p) => sum + (p.Rating ?? 0), 0) ?? 0;
                  const avg = darkTeam?.length ? total / darkTeam.length : 0;
                  return (
                    <Text size='sm' fw={500}>
                      Total: {total.toFixed(1)}, Average: {avg.toFixed(2)}
                    </Text>
                  );
                })()}
              </Table.Td>
            </Table.Tr>
          )}
        </Table.Tbody>
      </Table>
    </Paper>
  );
};
