import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ActivityLog, BuySell, Session } from '@/HockeyPickup.Api';
import { useAuth } from '@/lib/auth';
import { GET_SESSION } from '@/lib/queries';
import { useQuery } from '@apollo/client';
import {
  Collapse,
  Group,
  Image,
  Paper,
  Stack,
  Table,
  Text,
  Title,
  UnstyledButton,
} from '@mantine/core';
import { IconChevronRight } from '@tabler/icons-react';
import moment from 'moment';
import { useState } from 'react';

interface SessionTableProps {
  sessionId: number;
}

export const SessionTable = ({ sessionId }: SessionTableProps): JSX.Element => {
  const { loading, error, data } = useQuery(GET_SESSION, {
    variables: { SessionId: sessionId },
  });
  const { user } = useAuth();
  const [showLegacyBuySells, setShowLegacyBuySells] = useState(false);

  if (loading) return <LoadingSpinner />;
  if (error) return <Text c='red'>Error: {error.message}</Text>;

  const session = data?.Session as Session;
  console.info(session);

  return (
    <Stack gap='md'>
      <Paper shadow='sm' p='md'>
        <Title order={3} mb='md'>
          {moment.utc(session.SessionDate).format('dddd, MM/DD/yyyy, HH:mm')}
        </Title>
        <Stack gap='md'>
          <Group>
            <Text>{session.Note ?? '-'}</Text>
          </Group>
          <Group>
            <Text size='sm' fw={700} w={100} ta='right'>
              Buy Window:
            </Text>
            <Text>
              {moment
                .utc(session.SessionDate)
                .subtract(
                  user?.PreferredPlus
                    ? session.BuyDayMinimum
                    : user?.Preferred
                      ? session.BuyDayMinimum
                      : (session.BuyDayMinimum ?? 6) - 1,
                  'days',
                )
                .subtract(22, 'hours')
                .subtract(user?.PreferredPlus ? (session.BuyDayMinimum ?? 6) - 1 : 0, 'minutes')
                .format('dddd, MM/DD/yyyy, HH:mm')}
            </Text>
          </Group>
          <Group>
            <Text size='sm' fw={700} w={100} ta='right'>
              Created:
            </Text>
            <Text>{moment.utc(session.CreateDateTime).local().format('MM/DD/yyyy, HH:mm')}</Text>
          </Group>
          <Group>
            <Text size='sm' fw={700} w={100} ta='right'>
              Updated:
            </Text>
            <Text>{moment.utc(session.UpdateDateTime).local().format('MM/DD/yyyy, HH:mm')}</Text>
          </Group>
        </Stack>
      </Paper>

      {session.RegularSetId && session.CurrentRosters && session.CurrentRosters.length > 0 && (
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
                  session.CurrentRosters.filter((p) => p.TeamAssignment === 1).length,
                  session.CurrentRosters.filter((p) => p.TeamAssignment === 2).length,
                ),
              }).map((_, index) => {
                const lightPlayer = session.CurrentRosters?.filter((p) => p.TeamAssignment === 1)[
                  index
                ];
                const darkPlayer = session.CurrentRosters?.filter((p) => p.TeamAssignment === 2)[
                  index
                ];

                return (
                  <Table.Tr key={index}>
                    <Table.Td>
                      {lightPlayer && (
                        <Text
                          style={{
                            textDecoration: !lightPlayer.IsPlaying ? 'line-through' : 'none',
                          }}
                        >
                          {lightPlayer.FirstName} {lightPlayer.LastName}
                          {`, `}
                          {lightPlayer.CurrentPosition}
                        </Text>
                      )}
                    </Table.Td>
                    <Table.Td>
                      {darkPlayer && (
                        <Text
                          style={{
                            textDecoration: !darkPlayer.IsPlaying ? 'line-through' : 'none',
                          }}
                        >
                          {darkPlayer.FirstName} {darkPlayer.LastName}
                          {`, `}
                          {darkPlayer.CurrentPosition}
                        </Text>
                      )}
                    </Table.Td>
                  </Table.Tr>
                );
              })}
              <Table.Tr>
                <Table.Td>
                  <Text fw={700}>
                    {
                      session.CurrentRosters.filter((p) => p.TeamAssignment === 1 && p.IsPlaying)
                        .length
                    }{' '}
                    Players
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Text fw={700}>
                    {
                      session.CurrentRosters.filter((p) => p.TeamAssignment === 2 && p.IsPlaying)
                        .length
                    }{' '}
                    Players
                  </Text>
                </Table.Td>
              </Table.Tr>
            </Table.Tbody>
          </Table>
        </Paper>
      )}

      {session.BuyingQueues && session.BuyingQueues.length > 0 && (
        <Paper shadow='sm' p='md'>
          <Title order={3} mb='md'>
            Buying Queue
          </Title>
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Status</Table.Th>
                <Table.Th>Seller</Table.Th>
                <Table.Th>Buyer</Table.Th>
                <Table.Th>Team</Table.Th>
                <Table.Th>Queue Position</Table.Th>
                <Table.Th>Payment</Table.Th>
                <Table.Th>Notes</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {session.BuyingQueues.map((queue) => (
                <Table.Tr key={queue.BuySellId}>
                  <Table.Td>{queue.TransactionStatus}</Table.Td>
                  <Table.Td>{queue.SellerName ?? '-'}</Table.Td>
                  <Table.Td>{queue.BuyerName ?? '-'}</Table.Td>
                  <Table.Td>
                    {queue.TeamAssignment === 1
                      ? 'Light'
                      : queue.TeamAssignment === 2
                        ? 'Dark'
                        : '-'}
                  </Table.Td>
                  <Table.Td>{queue.QueueStatus}</Table.Td>
                  <Table.Td>
                    {queue.TransactionStatus === 'Looking to Buy'
                      ? '-'
                      : `${queue.PaymentSent ? 'Sent' : 'Pending'} / ${queue.PaymentReceived ? 'Received' : 'Pending'}`}
                  </Table.Td>
                  <Table.Td>
                    {queue.SellerNote && <Text size='sm'>Seller: {queue.SellerNote}</Text>}
                    {queue.BuyerNote && <Text size='sm'>Buyer: {queue.BuyerNote}</Text>}
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Paper>
      )}

      {session.ActivityLogs && session.ActivityLogs.length > 0 && (
        <Paper shadow='sm' p='md'>
          <Title order={3} mb='md'>
            Activity Log
          </Title>
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Date</Table.Th>
                <Table.Th>User</Table.Th>
                <Table.Th>Activity</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {session.ActivityLogs.map((log: ActivityLog) => (
                <Table.Tr key={log.ActivityLogId}>
                  <Table.Td>
                    {moment.utc(log.CreateDateTime).local().format('MM/DD/yyyy, HH:mm:ss.SSS')}
                  </Table.Td>
                  <Table.Td>{log.User?.FirstName + ' ' + log.User?.LastName || '-'}</Table.Td>
                  <Table.Td>{log.Activity}</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Paper>
      )}

      {session.BuySells && session.BuySells.length > 0 && (
        <Paper shadow='sm' p='md' mb='xl'>
          <UnstyledButton onClick={() => setShowLegacyBuySells(!showLegacyBuySells)}>
            <Group justify='space-between'>
              <Title order={3}>Legacy Buy/Sells Records</Title>
              <IconChevronRight
                style={{
                  transform: showLegacyBuySells ? 'rotate(90deg)' : 'none',
                  transition: 'transform 200ms ease',
                }}
              />
            </Group>
          </UnstyledButton>
          <Collapse in={showLegacyBuySells}>
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Seller</Table.Th>
                  <Table.Th>Buyer</Table.Th>
                  <Table.Th>Team</Table.Th>
                  <Table.Th>Payment Status</Table.Th>
                  <Table.Th>Created</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {session.BuySells.map((buySell: BuySell) => (
                  <Table.Tr key={buySell.BuySellId}>
                    <Table.Td>
                      {buySell.SellerUserId !== null
                        ? buySell.Seller?.FirstName + ' ' + buySell.Seller?.LastName
                        : '-'}
                    </Table.Td>
                    <Table.Td>
                      {buySell.BuyerUserId !== null
                        ? buySell.Buyer?.FirstName + ' ' + buySell.Buyer?.LastName
                        : '-'}
                    </Table.Td>
                    <Table.Td>
                      {buySell.TeamAssignment === 1
                        ? 'Light'
                        : buySell.TeamAssignment === 2
                          ? 'Dark'
                          : '-'}
                    </Table.Td>
                    <Table.Td>
                      {buySell.PaymentSent ? 'Sent' : 'Pending'} /
                      {buySell.PaymentReceived ? ' Received' : ' Pending'}
                    </Table.Td>
                    <Table.Td>
                      {moment.utc(buySell.CreateDateTime).local().format('MM/DD/yyyy, HH:mm')}
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Collapse>
        </Paper>
      )}
    </Stack>
  );
};
