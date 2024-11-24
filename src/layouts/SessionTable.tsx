import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ActivityLog, BuySell, Session } from '@/HockeyPickup.Api';
import { useAuth } from '@/lib/auth';
import { GET_SESSION } from '@/lib/queries';
import { useQuery } from '@apollo/client';
import { Paper, Stack, Table, Text, Title } from '@mantine/core';
import moment from 'moment';

interface SessionTableProps {
  sessionId: number;
}

export const SessionTable = ({ sessionId }: SessionTableProps): JSX.Element => {
  const { loading, error, data } = useQuery(GET_SESSION, {
    variables: { SessionId: sessionId },
  });
  const { user } = useAuth();

  if (loading) return <LoadingSpinner />;
  if (error) return <Text c='red'>Error: {error.message}</Text>;

  const session = data?.Session as Session;

  return (
    <Stack gap='md'>
      <Paper shadow='sm' p='md'>
        <Title order={3} mb='md'>
          Session Details
        </Title>
        <Table striped highlightOnHover>
          <Table.Tbody>
            <Table.Tr>
              <Table.Th>Session Date</Table.Th>
              <Table.Td>
                {moment.utc(session.SessionDate).format('dddd, MM/DD/yyyy, HH:mm')}
              </Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Th>Note</Table.Th>
              <Table.Td>{session.Note ?? '-'}</Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Th>Buy Window</Table.Th>
              <Table.Td>
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
              </Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Th>Created</Table.Th>
              <Table.Td>
                {moment.utc(session.CreateDateTime).local().format('MM/DD/yyyy, HH:mm')}
              </Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Th>Updated</Table.Th>
              <Table.Td>
                {moment.utc(session.UpdateDateTime).local().format('MM/DD/yyyy, HH:mm')}
              </Table.Td>
            </Table.Tr>
          </Table.Tbody>
        </Table>
      </Paper>

      {session.BuySells && session.BuySells.length > 0 && (
        <Paper shadow='sm' p='md'>
          <Title order={3} mb='md'>
            Buy/Sells
          </Title>
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Buyer</Table.Th>
                <Table.Th>Seller</Table.Th>
                <Table.Th>Team</Table.Th>
                <Table.Th>Payment Status</Table.Th>
                <Table.Th>Created</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {session.BuySells.map((buySell: BuySell) => (
                <Table.Tr key={buySell.BuySellId}>
                  <Table.Td>
                    {buySell.BuyerUserId !== null
                      ? buySell.Buyer?.FirstName + ' ' + buySell.Buyer?.LastName
                      : '-'}
                  </Table.Td>
                  <Table.Td>
                    {buySell.SellerUserId !== null
                      ? buySell.Seller?.FirstName + ' ' + buySell.Seller?.LastName
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
    </Stack>
  );
};
