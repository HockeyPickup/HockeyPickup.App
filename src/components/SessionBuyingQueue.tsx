import styles from '@/App.module.css';
import { SessionDetailedResponse } from '@/HockeyPickup.Api';
import { useAuth } from '@/lib/auth';
import { buySellService } from '@/lib/buysell';
import { GET_SESSION } from '@/lib/queries';
import { useQuery } from '@apollo/client';
import { Button, Checkbox, Group, Paper, Table, Text, Title } from '@mantine/core';
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
  const { user } = useAuth();

  const handlePaymentSentToggle = async (
    buySellId: number,
    currentStatus: boolean,
  ): Promise<void> => {
    try {
      const response = currentStatus
        ? await buySellService.unConfirmPaymentSent(buySellId)
        : await buySellService.confirmPaymentSent(buySellId);
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
      console.error('Failed to update payment sent status:', error);
      const errorMessage =
        (error as { response?: { data: { Message: string } } }).response?.data?.Message ??
        'Failed to update payment status';
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

  const handlePaymentReceivedToggle = async (
    buySellId: number,
    currentStatus: boolean,
  ): Promise<void> => {
    try {
      const response = currentStatus
        ? await buySellService.unConfirmPaymentReceived(buySellId)
        : await buySellService.confirmPaymentReceived(buySellId);
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
      console.error('Failed to update payment received status:', error);
      const errorMessage =
        (error as { response?: { data: { Message: string } } }).response?.data?.Message ??
        'Failed to update payment status';
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
            <Table.Th>Notes</Table.Th>
            <Table.Th>Team</Table.Th>
            <Table.Th>Queue Position</Table.Th>
            <Table.Th>Payment Status</Table.Th>
            <Table.Th>Payment</Table.Th>
            <Table.Th>Cancel</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {session.BuyingQueues?.map((queue) => (
            <Table.Tr key={queue.BuySellId}>
              <Table.Td>{queue.SellerName ?? '-'}</Table.Td>
              <Table.Td>{queue.BuyerName ?? '-'}</Table.Td>
              <Table.Td>
                {queue.SellerNote && <Text size='xs'>Seller: {queue.SellerNote}</Text>}
                {queue.BuyerNote && <Text size='xs'>Buyer: {queue.BuyerNote}</Text>}
              </Table.Td>
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
                {queue.BuyerUserId && queue.SellerUserId && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {user?.Id === queue.BuyerUserId && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Checkbox
                          size='xs'
                          label={
                            <Text size='xs'>
                              {queue.PaymentSent ? 'Unmark as Paid' : 'Mark as Paid'}
                            </Text>
                          }
                          checked={queue.PaymentSent}
                          onChange={() =>
                            handlePaymentSentToggle(queue.BuySellId, queue.PaymentSent)
                          }
                        />
                      </div>
                    )}
                    {user?.Id === queue.SellerUserId && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Checkbox
                          size='xs'
                          label={
                            <Text size='xs'>
                              {queue.PaymentReceived ? 'Unmark as Received' : 'Mark as Received'}
                            </Text>
                          }
                          checked={queue.PaymentReceived}
                          onChange={() =>
                            handlePaymentReceivedToggle(queue.BuySellId, queue.PaymentReceived)
                          }
                        />
                      </div>
                    )}
                  </div>
                )}
              </Table.Td>
              <Table.Td>
                <Group>
                  {user?.Id === queue.BuyerUserId && !(queue.BuyerUserId && queue.SellerUserId) && (
                    <Group>
                      <Button
                        variant='subtle'
                        color='red'
                        size='xs'
                        onClick={() => handleCancelBuy(queue.BuySellId)}
                        pl={0}
                        leftSection={<IconTrash size={14} />}
                      >
                        Remove Buy
                      </Button>
                    </Group>
                  )}
                  {user?.Id === queue.SellerUserId &&
                    !(queue.BuyerUserId && queue.SellerUserId) && (
                      <Group>
                        <Button
                          variant='subtle'
                          color='red'
                          size='xs'
                          onClick={() => handleCancelSell(queue.BuySellId)}
                          pl={0}
                          leftSection={<IconTrash size={14} />}
                        >
                          Remove Sell
                        </Button>
                      </Group>
                    )}
                </Group>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Paper>
  );
};
