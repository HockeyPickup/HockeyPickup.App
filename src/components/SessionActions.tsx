import { SessionDetailedResponse } from '@/HockeyPickup.Api';
import { useAuth } from '@/lib/auth';
import { buySellService } from '@/lib/buysell';
import { GET_SESSION } from '@/lib/queries';
import { useQuery } from '@apollo/client';
import { Button, Group, Paper, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import moment from 'moment';
import { JSX } from 'react';

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
        <Button onClick={handleBuy} color='blue'>
          Buy Spot
        </Button>
        <Button onClick={handleSell} color='red'>
          Sell Spot
        </Button>
      </Group>
    </Paper>
  );
};
