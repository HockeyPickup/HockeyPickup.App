import { SessionDetailedResponse } from '@/HockeyPickup.Api';
import { transactionService } from '@/lib/transaction';
import { Button, Group, Paper } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { JSX } from 'react';

interface SessionActionsProps {
  session: SessionDetailedResponse;
}

export const SessionActions = ({ session }: SessionActionsProps): JSX.Element => {
  const handleBuy = async (): Promise<void> => {
    try {
      const response = await transactionService.buySpot({
        SessionId: session.SessionId,
      });

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
      const response = await transactionService.sellSpot({
        SessionId: session.SessionId,
      });

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
      <Group justify='center'>
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
