import styles from '@/App.module.css';
import { SessionDetailedResponse } from '@/HockeyPickup.Api';
import { buySellService } from '@/lib/buysell';
import { GET_SESSION } from '@/lib/queries';
import { useQuery } from '@apollo/client';
import { ActionIcon, Paper, Table, Text, Title } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconTrash } from '@tabler/icons-react';
import { JSX } from 'react';

interface SessionBuyingQueueProps {
  session: SessionDetailedResponse;
  onSessionUpdate: (_session: SessionDetailedResponse) => void;
}

export const SessionBuyingQueue = ({
  session,
  onSessionUpdate,
}: SessionBuyingQueueProps): JSX.Element => {
  const { refetch } = useQuery(GET_SESSION, {
    variables: { SessionId: session.SessionId },
    skip: true, // Skip initial fetch
  });

  const handleCancelSell = async (buySellId: number): Promise<void> => {
    try {
      const response = await buySellService.cancelSell(buySellId);
      const { data } = await refetch();
      if (data?.Session) {
        onSessionUpdate(data.Session);
      }
      notifications.show({
        position: 'top-center',
        autoClose: 5000,
        style: { marginTop: '60px' },
        title: 'Success',
        message: response.Message,
        color: 'green',
      });
    } catch (error) {
      console.error('Failed to cancel sell:', error);
      const errorMessage =
        (error as { response?: { data: { Message: string } } }).response?.data?.Message ??
        'Failed to cancel sell request';
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

  const handleCancelBuy = async (buySellId: number): Promise<void> => {
    try {
      const response = await buySellService.cancelBuy(buySellId);
      const { data } = await refetch();
      if (data?.Session) {
        onSessionUpdate(data.Session);
      }
      notifications.show({
        position: 'top-center',
        autoClose: 5000,
        style: { marginTop: '60px' },
        title: 'Success',
        message: response.Message,
        color: 'green',
      });
    } catch (error) {
      console.error('Failed to cancel buy:', error);
      const errorMessage =
        (error as { response?: { data: { Message: string } } }).response?.data?.Message ??
        'Failed to cancel buy request';
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
    <Paper shadow='sm' p='md'>
      <Title order={3} mb='md'>
        Buying / Selling Queue
      </Title>
      <Table striped highlightOnHover className={styles.table}>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Seller</Table.Th>
            <Table.Th>Buyer</Table.Th>
            <Table.Th>Team</Table.Th>
            <Table.Th>Queue Position</Table.Th>
            <Table.Th>Payment</Table.Th>
            <Table.Th>Notes</Table.Th>
            <Table.Th>Cancel Sell</Table.Th>
            <Table.Th>Cancel Buy</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {session.BuyingQueues?.map((queue) => (
            <Table.Tr key={queue.BuySellId}>
              <Table.Td>{queue.SellerName ?? '-'}</Table.Td>
              <Table.Td>{queue.BuyerName ?? '-'}</Table.Td>
              <Table.Td>{queue.TeamAssignment}</Table.Td>
              <Table.Td>{queue.QueueStatus}</Table.Td>
              <Table.Td>
                {queue.TransactionStatus === 'Looking to Buy'
                  ? '-'
                  : `${queue.PaymentSent ? 'Sent' : 'Pending'} / ${
                      queue.PaymentReceived ? 'Received' : 'Pending'
                    }`}
              </Table.Td>
              <Table.Td>
                {queue.SellerNote && <Text size='xs'>Seller: {queue.SellerNote}</Text>}
                {queue.BuyerNote && <Text size='xs'>Buyer: {queue.BuyerNote}</Text>}
              </Table.Td>
              <Table.Td>
                {queue.SellerName && (
                  <ActionIcon
                    variant='subtle'
                    color='red'
                    onClick={() => handleCancelSell(queue.BuySellId)}
                  >
                    <IconTrash size={16} />
                  </ActionIcon>
                )}
              </Table.Td>
              <Table.Td>
                {queue.BuyerName && (
                  <ActionIcon
                    variant='subtle'
                    color='red'
                    onClick={() => handleCancelBuy(queue.BuySellId)}
                  >
                    <IconTrash size={16} />
                  </ActionIcon>
                )}
              </Table.Td>{' '}
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Paper>
  );
};
