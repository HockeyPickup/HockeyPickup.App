import { RosterPlayer, Session } from '@/HockeyPickup.Api';
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
import { useState } from 'react';

interface SessionRosterProps {
  session: Session;
}

interface PlayerCellProps {
  player: RosterPlayer | undefined;
  editingPlayer: { userId: string; currentPosition: string } | null;
  onEditClick: (_userId: string, _currentPosition: string) => void;
  onPositionChange: (_userId: string, _newPosition: string) => Promise<void>;
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
  if (!player) return null;

  return (
    <Group>
      <Text
        style={{
          textDecoration: !player.IsPlaying ? 'line-through' : 'none',
        }}
      >
        {player.FirstName} {player.LastName}, {player.CurrentPosition}
      </Text>
      <Popover
        position='top'
        withArrow
        shadow='md'
        opened={editingPlayer?.userId === player.UserId}
        onClose={onClose}
      >
        <Popover.Target>
          <ActionIcon
            size='sm'
            variant='subtle'
            onClick={() => {
              if (editingPlayer?.userId === player.UserId) {
                onClose(); // If already open, close it
              } else {
                onEditClick(player.UserId ?? '', player.CurrentPosition ?? 'TBD'); // If closed, open it
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
              value={editingPlayer?.currentPosition}
              onChange={(value) => onPositionChange(editingPlayer?.userId ?? '', value)}
            >
              <Stack>
                <Radio value='Defense' label='Defense' />
                <Radio value='Forward' label='Forward' />
                <Radio value='TBD' label='TBD' />
              </Stack>
            </Radio.Group>

            <Divider my='xs' />

            <Text size='sm' fw={500}>
              Team
            </Text>
            <Radio.Group
              value={player.TeamAssignment?.toString()}
              onChange={(value) => onTeamChange(player.UserId ?? '', parseInt(value) as 1 | 2)}
            >
              <Stack>
                <Radio value='1' label='Rockets (Light)' />
                <Radio value='2' label='Beauties (Dark)' />
              </Stack>
            </Radio.Group>
          </Stack>
        </Popover.Dropdown>
      </Popover>
    </Group>
  );
};

export const SessionRoster = ({ session }: SessionRosterProps): JSX.Element => {
  const [editingPlayer, setEditingPlayer] = useState<{
    userId: string;
    currentPosition: string;
  } | null>(null);

  const handlePositionChange = async (userId: string, newPosition: string): Promise<void> => {
    try {
      console.info('Updating position:', {
        sessionId: session.SessionId,
        userId,
        position: newPosition,
      });
      await new Promise((resolve) => setTimeout(resolve, 500));

      const player = session.CurrentRosters?.find((p) => p.UserId === userId);
      const oldPosition = player?.CurrentPosition ?? 'TBD';

      setEditingPlayer(null);
      notifications.show({
        position: 'top-center',
        autoClose: 5000,
        style: { marginTop: '60px' },
        title: 'Position Updated',
        message: `${player?.FirstName} ${player?.LastName} changed from ${oldPosition} to ${newPosition}`,
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
      await new Promise((resolve) => setTimeout(resolve, 500));

      const player = session.CurrentRosters?.find((p) => p.UserId === userId);
      const oldTeam = player?.TeamAssignment === 1 ? 'Rockets (Light)' : 'Beauties (Dark)';
      const newTeamName = newTeam === 1 ? 'Rockets (Light)' : 'Beauties (Dark)';

      setEditingPlayer(null);
      notifications.show({
        position: 'top-center',
        autoClose: 5000,
        style: { marginTop: '60px' },
        title: 'Team Updated',
        message: `${player?.FirstName} ${player?.LastName} moved from ${oldTeam} to ${newTeamName}`,
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
                <Text>Rockets (Light)</Text>
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
                <Text>Beauties (Dark)</Text>
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
                    onEditClick={(userId, currentPosition) =>
                      setEditingPlayer({ userId, currentPosition })
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
                    onEditClick={(userId, currentPosition) =>
                      setEditingPlayer({ userId, currentPosition })
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
              <Text fw={700}>
                {
                  session.CurrentRosters?.filter((p) => p.TeamAssignment === 1 && p.IsPlaying)
                    .length
                }{' '}
                Players
              </Text>
            </Table.Td>
            <Table.Td>
              <Text fw={700}>
                {
                  session.CurrentRosters?.filter((p) => p.TeamAssignment === 2 && p.IsPlaying)
                    .length
                }{' '}
                Players
              </Text>
            </Table.Td>
          </Table.Tr>
        </Table.Tbody>
      </Table>
    </Paper>
  );
};
