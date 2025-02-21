import { SessionDetailedResponse } from '@/HockeyPickup.Api';
import { useAuth } from '@/lib/auth';
import { buySellService } from '@/lib/buysell';
import { GET_SESSION } from '@/lib/queries';
import { useQuery } from '@apollo/client';
import { Button, Group, Modal, Paper, Text, Textarea } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import moment from 'moment';
import { JSX, useEffect, useState } from 'react';

interface SessionActionsProps {
  session: SessionDetailedResponse;
  onSessionUpdate: (_session: SessionDetailedResponse) => void;
}

export const SessionActions = ({ session, onSessionUpdate }: SessionActionsProps): JSX.Element => {
  const { refetch } = useQuery(GET_SESSION, {
    variables: { SessionId: session.SessionId },
    skip: true, // Skip initial fetch
  });
  const { user } = useAuth();
  const [canBuySpot, setCanBuySpot] = useState(false);
  const [canSellSpot, setCanSellSpot] = useState(false);
  const [, setIsLoading] = useState(true);
  const [isAdminBuying, setIsAdminBuying] = useState(false);
  const [buyModalOpen, setBuyModalOpen] = useState(false);
  const [sellModalOpen, setSellModalOpen] = useState(false);
  const [note, setNote] = useState('');
  const [isTransacting, setIsTransacting] = useState(false);

  useEffect(() => {
    const checkPermissions = async (): Promise<void> => {
      try {
        setIsLoading(true);
        const [buyResponse, sellResponse] = await Promise.all([
          buySellService.canBuy(session.SessionId ?? 0),
          buySellService.canSell(session.SessionId ?? 0),
        ]);

        setCanBuySpot(buyResponse.Data?.IsAllowed ?? false);
        setCanSellSpot(sellResponse.Data?.IsAllowed ?? false);
        setIsAdminBuying(
          buyResponse.Data?.Reason === 'Admins can buy spots regardless of time window',
        );
      } catch (error) {
        console.error('Failed to check buy/sell permissions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkPermissions();
  }, [session]);

  const getBuyWindowDate = (): string | undefined => {
    if (user?.PreferredPlus) {
      return session.BuyWindowPreferredPlus;
    } else if (user?.Preferred) {
      return session.BuyWindowPreferred;
    }
    return session.BuyWindow;
  };

  const buyWindowOpen = moment().tz('America/Los_Angeles') >= moment.utc(getBuyWindowDate());
  const buyWindowDate = moment.utc(getBuyWindowDate()).format('dddd, MM/DD/yyyy, HH:mm');

  const handleBuy = async (): Promise<void> => {
    if (isTransacting) return;
    try {
      setIsTransacting(true);
      const response = await buySellService.buySpot({
        SessionId: session.SessionId,
        Note: note,
      });
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
      setBuyModalOpen(false);
      setNote('');
    } catch (error) {
      console.error('Failed to buy transaction:', error);
      const errorMessage =
        (error as { response?: { data: { Message: string } } }).response?.data?.Message ??
        'Failed to buy transaction';
      notifications.show({
        position: 'top-center',
        autoClose: 5000,
        style: { marginTop: '60px' },
        title: 'Error',
        message: errorMessage,
        color: 'red',
      });
    } finally {
      setIsTransacting(false);
    }
  };

  const handleSell = async (): Promise<void> => {
    if (isTransacting) return;
    try {
      setIsTransacting(true);
      const response = await buySellService.sellSpot({
        SessionId: session.SessionId,
        Note: note,
      });
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
      setSellModalOpen(false);
      setNote('');
    } catch (error) {
      console.error('Failed to sell transaction:', error);
      const errorMessage =
        (error as { response?: { data: { Message: string } } }).response?.data?.Message ??
        'Failed to sell transaction';
      notifications.show({
        position: 'top-center',
        autoClose: 5000,
        style: { marginTop: '60px' },
        title: 'Error',
        message: errorMessage,
        color: 'red',
      });
    } finally {
      setIsTransacting(false);
    }
  };

  return (
    <div style={{ marginTop: -16 }}>
      <Paper shadow='sm' p='xs' style={{ marginTop: 0, marginBottom: 0 }}>
        <Group>
          <Text fw={700}>
            Buy Window
            {user?.PreferredPlus ? ' (Preferred Plus)' : user?.Preferred ? ' (Preferred)' : ''}
            {buyWindowOpen ? ' opened on ' : ' will open on '}
            {buyWindowDate}
          </Text>
        </Group>
        {!user?.Active && (
          <Group>
            <Text>
              You must be an Active player to Buy or Sell a spot. Contact the commissioner to
              activate your account.
            </Text>
          </Group>
        )}
        <Group justify='left' mt='sm'>
          {canBuySpot && (
            <Button onClick={() => setBuyModalOpen(true)} color='green' loading={isTransacting}>
              {isAdminBuying ? 'Buy Spot (Admin)' : 'Buy Spot'}
            </Button>
          )}
          {canSellSpot && (
            <Button onClick={() => setSellModalOpen(true)} color='red' loading={isTransacting}>
              Sell Spot
            </Button>
          )}
        </Group>
      </Paper>
      <Modal
        opened={buyModalOpen}
        onClose={() => {
          setBuyModalOpen(false);
          setNote('');
        }}
        title='Buy a Spot'
      >
        <Textarea
          label='Note (optional)'
          value={note}
          onChange={(event) => setNote(event.currentTarget.value)}
          mb='md'
        />
        <Group justify='flex-end'>
          <Button
            variant='outline'
            onClick={() => {
              setBuyModalOpen(false);
              setNote('');
            }}
          >
            Cancel
          </Button>
          <Button color='green' onClick={handleBuy}>
            Buy Spot
          </Button>
        </Group>
      </Modal>
      <Modal
        opened={sellModalOpen}
        onClose={() => {
          setSellModalOpen(false);
          setNote('');
        }}
        title='Sell your Spot'
      >
        <Textarea
          label='Note (optional)'
          value={note}
          onChange={(event) => setNote(event.currentTarget.value)}
          mb='md'
        />
        <Group justify='flex-end'>
          <Button
            variant='outline'
            onClick={() => {
              setSellModalOpen(false);
              setNote('');
            }}
          >
            Cancel
          </Button>
          <Button color='red' onClick={handleSell}>
            Sell Spot
          </Button>
        </Group>
      </Modal>
    </div>
  );
};
