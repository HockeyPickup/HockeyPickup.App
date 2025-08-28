import styles from '@/App.module.css';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { LockerRoom13Players, LockerRoom13Response, PlayerStatus } from '@/HockeyPickup.Api';
import { GET_LOCKERROOM13 } from '@/lib/queries';
import { LockerRoom13QueryResult } from '@/types/graphql';
import { useQuery } from '@apollo/client/react';
import { Paper, rem, Table, Text } from '@mantine/core';
import { IconCheck, IconQuestionMark, IconX } from '@tabler/icons-react';
import moment from 'moment';
import { JSX } from 'react';
import { useNavigate } from 'react-router-dom';

export const LockerRoom13Table = (): JSX.Element => {
  const navigate = useNavigate();
  const { loading, error, data } = useQuery<LockerRoom13QueryResult>(GET_LOCKERROOM13);

  if (loading) return <LoadingSpinner />;
  if (error) return <Text c='red'>Error: {error.message}</Text>;

  const getStatusPriority = (playerStatus: PlayerStatus): number => {
    switch (playerStatus) {
      case PlayerStatus.Regular:
      case PlayerStatus.Substitute:
        return 1;
      case PlayerStatus.InQueue:
        return 2;
      case PlayerStatus.NotPlaying:
        return 3;
      default:
        return 4;
    }
  };

  const getStatusIcon = (playerStatus: PlayerStatus): JSX.Element => {
    const iconSize = rem(16);

    switch (playerStatus) {
      case PlayerStatus.Regular:
      case PlayerStatus.Substitute:
        return <IconCheck style={{ width: iconSize, height: iconSize }} color='green' />;
      case PlayerStatus.NotPlaying:
        return <IconX style={{ width: iconSize, height: iconSize }} color='red' />;
      case PlayerStatus.InQueue:
        return <IconQuestionMark style={{ width: iconSize, height: iconSize }} color='gray' />;
      default:
        return <></>;
    }
  };
  return (
    <Paper shadow='sm' p='md'>
      {data?.LockerRoom13.map((session: LockerRoom13Response) => {
        // Sort players by status priority and first name
        const sortedPlayers = [...session.LockerRoom13Players].sort((a, b) => {
          const statusCompare =
            getStatusPriority(a.PlayerStatus) - getStatusPriority(b.PlayerStatus);
          if (statusCompare !== 0) return statusCompare;
          return (a.LastName ?? '').localeCompare(b.LastName ?? '');
        });

        return (
          <Table key={session.SessionId} striped className={styles.table} mb='lg'>
            <Table.Thead>
              <Table.Tr
                key={session.SessionId}
                onClick={() => navigate(`/session/${session.SessionId}`)}
                style={{ cursor: 'pointer' }}
              >
                <Table.Th>
                  <Text size='md' fw={700}>
                    {moment.utc(session.SessionDate).format('dddd, MM/DD/yyyy, HH:mm')}
                  </Text>
                </Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {sortedPlayers.map((player: LockerRoom13Players) => (
                <Table.Tr key={player.Id}>
                  <Table.Td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {getStatusIcon(player.PlayerStatus)}
                      <span>{`${player.FirstName} ${player.LastName}`}</span>
                    </div>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        );
      })}
    </Paper>
  );
};
