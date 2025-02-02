import { SessionDetailedResponse } from '@/HockeyPickup.Api';
import { useAuth } from '@/lib/auth';
import { buySellService } from '@/lib/buysell';
import { GET_SESSION } from '@/lib/queries';
import { useQuery } from '@apollo/client';
import { Button, Group, Paper, Text } from '@mantine/core';
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
    try {
      const response = await buySellService.buySpot({
        SessionId: session.SessionId,
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
    }
  };

  const handleSell = async (): Promise<void> => {
    try {
      const response = await buySellService.sellSpot({
        SessionId: session.SessionId,
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
    }
  };

  return (
    <Paper shadow='sm' p='md'>
      <Group mt='md'>
        <Text fw={700}>
          Buy Window
          {user?.PreferredPlus ? ' (Preferred Plus)' : user?.Preferred ? ' (Preferred)' : ''}
          {buyWindowOpen ? ' opened on ' : ' will open on '}
          {buyWindowDate}
        </Text>
      </Group>
      <Group justify='left'>
        {canBuySpot && (
          <Button onClick={handleBuy} color='blue'>
            {isAdminBuying ? 'Buy Spot (Admin)' : 'Buy Spot'}
          </Button>
        )}
        {canSellSpot && (
          <Button onClick={handleSell} color='red'>
            Sell Spot
          </Button>
        )}
      </Group>
    </Paper>
  );
};
