import { Session } from '@/HockeyPickup.Api';
import {
  ActionIcon,
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
                  {lightPlayer && (
                    <Group>
                      <Text
                        style={{
                          textDecoration: !lightPlayer.IsPlaying ? 'line-through' : 'none',
                        }}
                      >
                        {lightPlayer.FirstName} {lightPlayer.LastName},{' '}
                        {lightPlayer.CurrentPosition}
                      </Text>
                      <Popover
                        position='top'
                        withArrow
                        shadow='md'
                        opened={editingPlayer?.userId === lightPlayer.UserId}
                        onClose={() => setEditingPlayer(null)}
                      >
                        <Popover.Target>
                          <ActionIcon
                            size='sm'
                            variant='subtle'
                            onClick={() =>
                              setEditingPlayer({
                                userId: lightPlayer.UserId ?? '',
                                currentPosition: lightPlayer.CurrentPosition ?? 'TBD',
                              })
                            }
                          >
                            <IconPencil size={16} />
                          </ActionIcon>
                        </Popover.Target>
                        <Popover.Dropdown>
                          <Radio.Group
                            value={editingPlayer?.currentPosition}
                            onChange={(value) =>
                              handlePositionChange(editingPlayer?.userId ?? '', value)
                            }
                          >
                            <Stack>
                              <Radio value='Defense' label='Defense' />
                              <Radio value='Forward' label='Forward' />
                              <Radio value='TBD' label='TBD' />
                            </Stack>
                          </Radio.Group>
                        </Popover.Dropdown>
                      </Popover>
                    </Group>
                  )}
                </Table.Td>
                <Table.Td>
                  {darkPlayer && (
                    <Group>
                      <Text
                        style={{
                          textDecoration: !darkPlayer.IsPlaying ? 'line-through' : 'none',
                        }}
                      >
                        {darkPlayer.FirstName} {darkPlayer.LastName}, {darkPlayer.CurrentPosition}
                      </Text>
                      <Popover
                        position='top'
                        withArrow
                        shadow='md'
                        opened={editingPlayer?.userId === darkPlayer.UserId}
                        onClose={() => setEditingPlayer(null)}
                      >
                        <Popover.Target>
                          <ActionIcon
                            size='sm'
                            variant='subtle'
                            onClick={() =>
                              setEditingPlayer({
                                userId: darkPlayer.UserId ?? '',
                                currentPosition: darkPlayer.CurrentPosition ?? 'TBD',
                              })
                            }
                          >
                            <IconPencil size={16} />
                          </ActionIcon>
                        </Popover.Target>
                        <Popover.Dropdown>
                          <Radio.Group
                            value={editingPlayer?.currentPosition}
                            onChange={(value) =>
                              handlePositionChange(editingPlayer?.userId ?? '', value)
                            }
                          >
                            <Stack>
                              <Radio value='Defense' label='Defense' />
                              <Radio value='Forward' label='Forward' />
                              <Radio value='TBD' label='TBD' />
                            </Stack>
                          </Radio.Group>
                        </Popover.Dropdown>
                      </Popover>
                    </Group>
                  )}
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
