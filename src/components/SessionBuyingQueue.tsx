import styles from '@/App.module.css';
import { BuyingQueueItem, PaymentMethodType, SessionDetailedResponse } from '@/HockeyPickup.Api';
import { useAuth } from '@/lib/auth';
import { buySellService } from '@/lib/buysell';
import { GET_SESSION } from '@/lib/queries';
import { useQuery } from '@apollo/client';
import { Button, Checkbox, Group, Paper, Table, Text, Title } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconTrash } from '@tabler/icons-react';
import moment from 'moment';
import { JSX, useState } from 'react';
import { PaymentButtons } from './PaymentButtons';

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
  const { user, refreshUser } = useAuth();
  const [lastUsedPaymentMethod, setLastUsedPaymentMethod] = useState<{
    [key: number]: PaymentMethodType;
  }>({});
  const [loadingStates, setLoadingStates] = useState<{ [key: number]: boolean }>({});

  const handlePaymentSentToggle = async (
    buySellId: number,
    currentStatus: boolean,
  ): Promise<void> => {
    setLoadingStates((prev) => ({ ...prev, [buySellId]: true }));
    try {
      const response = currentStatus
        ? await buySellService.unConfirmPaymentSent(buySellId)
        : await buySellService.confirmPaymentSent(
            buySellId,
            lastUsedPaymentMethod[buySellId] || PaymentMethodType.Unknown,
          );
      const { data } = await refetch();
      if (data?.Session) {
        onSessionUpdate(data.Session);
      }
      await refreshUser();
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
    } finally {
      setLoadingStates((prev) => ({ ...prev, [buySellId]: false }));
    }
  };

  const handlePaymentReceivedToggle = async (
    buySellId: number,
    currentStatus: boolean,
  ): Promise<void> => {
    setLoadingStates((prev) => ({ ...prev, [buySellId]: true }));
    try {
      const response = currentStatus
        ? await buySellService.unConfirmPaymentReceived(buySellId)
        : await buySellService.confirmPaymentReceived(buySellId);
      const { data } = await refetch();
      if (data?.Session) {
        onSessionUpdate(data.Session);
      }
      await refreshUser();
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
    } finally {
      setLoadingStates((prev) => ({ ...prev, [buySellId]: false }));
    }
  };

  const handleCancelSell = async (buySellId: number): Promise<void> => {
    setLoadingStates((prev) => ({ ...prev, [buySellId]: true }));
    try {
      const response = await buySellService.cancelSell(buySellId);
      const { data } = await refetch();
      if (data?.Session) {
        onSessionUpdate(data.Session);
      }
      await refreshUser();
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
    } finally {
      setLoadingStates((prev) => ({ ...prev, [buySellId]: false }));
    }
  };

  const handleCancelBuy = async (buySellId: number): Promise<void> => {
    setLoadingStates((prev) => ({ ...prev, [buySellId]: true }));
    try {
      const response = await buySellService.cancelBuy(buySellId);
      const { data } = await refetch();
      if (data?.Session) {
        onSessionUpdate(data.Session);
      }
      await refreshUser();
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
    } finally {
      setLoadingStates((prev) => ({ ...prev, [buySellId]: false }));
    }
  };

  const renderMobileRow = (queue: BuyingQueueItem): JSX.Element => (
    <Paper p='xs' mb='sm' withBorder key={`queue-mobile-${queue.BuySellId}`}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <Group justify='space-between'>
          <div>
            <Text size='sm' fw={500}>
              Seller: {queue.SellerName ?? 'TBD'}
            </Text>
            <Text size='sm' fw={500}>
              Buyer: {queue.BuyerName ?? 'TBD'}
            </Text>
            {queue.QueueStatus && <Text size='sm'>Queue: {queue.QueueStatus}</Text>}
          </div>
        </Group>

        {(queue.SellerNote ?? queue.BuyerNote) && (
          <div>
            {queue.SellerNote && <Text size='sm'>Seller Note: {queue.SellerNote}</Text>}
            {queue.BuyerNote && <Text size='sm'>Buyer Note: {queue.BuyerNote}</Text>}
          </div>
        )}

        <Group justify='space-between' align='center'>
          {queue.BuyerUserId && queue.SellerUserId && (
            <Text size='sm'>
              Payment Status: {queue.PaymentSent ? 'Sent' : 'Pending'} /{' '}
              {queue.PaymentReceived ? 'Received' : 'Pending'}
            </Text>
          )}
        </Group>

        {queue.BuyerUserId && queue.SellerUserId && (
          <Group>
            {user?.Id === queue.BuyerUserId && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {queue.Seller && !queue.PaymentSent && (
                  <PaymentButtons
                    key={`payment-buttons-${queue.BuySellId}`}
                    user={queue.Seller}
                    defaultAmount={session.Cost!}
                    defaultDescription={`Payment for Session - ${moment.utc(session.SessionDate).format('dddd, MM/DD/yyyy, HH:mm')}`}
                    onPaymentMethodClick={(method) =>
                      setLastUsedPaymentMethod((prev) => ({
                        ...prev,
                        [queue.BuySellId]: method,
                      }))
                    }
                  />
                )}
                <Checkbox
                  size='xs'
                  label={queue.PaymentSent ? 'Unmark as Paid' : 'Mark as Paid'}
                  checked={queue.PaymentSent}
                  onChange={() => handlePaymentSentToggle(queue.BuySellId, queue.PaymentSent)}
                  disabled={loadingStates[queue.BuySellId]}
                />
              </div>
            )}
            {user?.Id === queue.SellerUserId && (
              <Checkbox
                size='xs'
                label={queue.PaymentReceived ? 'Unmark as Received' : 'Mark as Received'}
                checked={queue.PaymentReceived}
                onChange={() => handlePaymentReceivedToggle(queue.BuySellId, queue.PaymentReceived)}
                disabled={loadingStates[queue.BuySellId]}
              />
            )}
          </Group>
        )}

        <Group>
          {user?.Id === queue.BuyerUserId && !(queue.BuyerUserId && queue.SellerUserId) && (
            <Button
              variant='subtle'
              color='red'
              size='xs'
              onClick={() => handleCancelBuy(queue.BuySellId)}
              leftSection={<IconTrash size={14} />}
              ml={-10}
              loading={loadingStates[queue.BuySellId]}
            >
              Remove Buy
            </Button>
          )}
          {user?.Id === queue.SellerUserId && !(queue.BuyerUserId && queue.SellerUserId) && (
            <Button
              variant='subtle'
              color='red'
              size='xs'
              onClick={() => handleCancelSell(queue.BuySellId)}
              leftSection={<IconTrash size={14} />}
              ml={-10}
              loading={loadingStates[queue.BuySellId]}
            >
              Remove Sell
            </Button>
          )}
        </Group>
      </div>
    </Paper>
  );

  const renderDesktopRow = (queue: BuyingQueueItem): JSX.Element => (
    <Table.Tr key={`queue-row-${queue.BuySellId}`}>
      <Table.Td>{queue.SellerName ?? 'TBD'}</Table.Td>
      <Table.Td>{queue.BuyerName ?? 'TBD'}</Table.Td>
      <Table.Td>
        {queue.SellerNote && <Text size='xs'>Seller: {queue.SellerNote}</Text>}
        {queue.BuyerNote && <Text size='xs'>Buyer: {queue.BuyerNote}</Text>}
      </Table.Td>
      <Table.Td>{queue.QueueStatus}</Table.Td>
      <Table.Td>
        {queue.BuyerUserId && queue.SellerUserId && (
          <Text size='xs'>
            {queue.PaymentSent ? 'Sent' : 'Pending'} /{' '}
            {queue.PaymentReceived ? 'Received' : 'Pending'}
          </Text>
        )}{' '}
      </Table.Td>
      <Table.Td>
        {queue.BuyerUserId && queue.SellerUserId && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {user?.Id === queue.BuyerUserId && (
              <Group>
                <div
                  key={`buyer-controls-${queue.BuySellId}`}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  {queue.Seller && !queue.PaymentSent && (
                    <Group>
                      <PaymentButtons
                        key={`payment-buttons-${queue.BuySellId}`}
                        user={queue.Seller}
                        defaultAmount={session.Cost!}
                        defaultDescription={`Payment for Session - ${moment.utc(session.SessionDate).format('dddd, MM/DD/yyyy, HH:mm')}`}
                        onPaymentMethodClick={(method) =>
                          setLastUsedPaymentMethod((prev) => ({
                            ...prev,
                            [queue.BuySellId]: method,
                          }))
                        }
                      />
                    </Group>
                  )}{' '}
                  <Checkbox
                    key={`buyer-checkbox-${queue.BuySellId}`}
                    size='xs'
                    label={
                      <Text size='xs'>{queue.PaymentSent ? 'Unmark as Paid' : 'Mark as Paid'}</Text>
                    }
                    checked={queue.PaymentSent}
                    onChange={() => handlePaymentSentToggle(queue.BuySellId, queue.PaymentSent)}
                    disabled={loadingStates[queue.BuySellId]}
                  />
                </div>
              </Group>
            )}
            {user?.Id === queue.SellerUserId && (
              <div
                key={`seller-controls-${queue.BuySellId}`}
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <Checkbox
                  key={`seller-checkbox-${queue.BuySellId}`}
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
                  disabled={loadingStates[queue.BuySellId]}
                />
              </div>
            )}
          </div>
        )}
      </Table.Td>
      <Table.Td>
        <Group>
          {user?.Id === queue.BuyerUserId && !(queue.BuyerUserId && queue.SellerUserId) && (
            <Group key={`buyer-${queue.BuySellId}`}>
              <Button
                variant='subtle'
                color='red'
                size='xs'
                onClick={() => handleCancelBuy(queue.BuySellId)}
                pl={0}
                leftSection={<IconTrash size={14} />}
                loading={loadingStates[queue.BuySellId]}
              >
                Remove Buy
              </Button>
            </Group>
          )}
          {user?.Id === queue.SellerUserId && !(queue.BuyerUserId && queue.SellerUserId) && (
            <Group key={`seller-${queue.BuySellId}`}>
              <Button
                variant='subtle'
                color='red'
                size='xs'
                onClick={() => handleCancelSell(queue.BuySellId)}
                pl={0}
                leftSection={<IconTrash size={14} />}
                loading={loadingStates[queue.BuySellId]}
              >
                Remove Sell
              </Button>
            </Group>
          )}
        </Group>
      </Table.Td>
    </Table.Tr>
  );

  return (
    <Paper shadow='sm' p='md'>
      <Title order={3} mb='md'>
        Buying / Selling Queue
      </Title>
      <div className={styles.mobileOnly}>{session.BuyingQueues?.map(renderMobileRow)}</div>
      <div className={styles.desktopOnly}>
        <Table striped className={styles.table}>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Seller</Table.Th>
              <Table.Th>Buyer</Table.Th>
              <Table.Th>Notes</Table.Th>
              <Table.Th>Queue Position</Table.Th>
              <Table.Th>Payment Status</Table.Th>
              <Table.Th>Payment</Table.Th>
              <Table.Th>Cancel</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>{session.BuyingQueues?.map(renderDesktopRow)}</Table.Tbody>
        </Table>
      </div>
    </Paper>
  );
};
