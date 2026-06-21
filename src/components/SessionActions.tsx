import { BuyActionState, BuySellStatusResponse, LotteryClass, SessionDetailedResponse } from '@/HockeyPickup.Api';
import { useAuth } from '@/lib/auth';
import { buySellService } from '@/lib/buysell';
import { GET_SESSION } from '@/lib/queries';
import { useQuery } from '@apollo/client/react';
import { SessionQueryResult } from '@/types/graphql';
import { Button, Group, Modal, Paper, Text, Textarea } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import moment from 'moment';
import { JSX, useCallback, useEffect, useState } from 'react';

interface SessionActionsProps {
  session: SessionDetailedResponse;
  onSessionUpdate: (_session: SessionDetailedResponse) => void;
}

export const SessionActions = ({ session, onSessionUpdate }: SessionActionsProps): JSX.Element => {
  const { refetch } = useQuery<SessionQueryResult>(GET_SESSION, {
    variables: { SessionId: session.SessionId },
    skip: true, // Skip initial fetch
  });
  const { user } = useAuth();
  const [buyStatus, setBuyStatus] = useState<BuySellStatusResponse | null>(null);
  const [canSellSpot, setCanSellSpot] = useState(false);
  const [, setIsLoading] = useState(true);
  const [isAdminBuying, setIsAdminBuying] = useState(false);
  const [buyModalOpen, setBuyModalOpen] = useState(false);
  const [sellModalOpen, setSellModalOpen] = useState(false);
  const [note, setNote] = useState('');
  const [isTransacting, setIsTransacting] = useState(false);

  const checkPermissions = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      const [buyResponse, sellResponse] = await Promise.all([
        buySellService.canBuy(session.SessionId ?? 0),
        buySellService.canSell(session.SessionId ?? 0),
      ]);

      setBuyStatus(buyResponse.Data ?? null);
      setCanSellSpot(sellResponse.Data?.IsAllowed ?? false);
      setIsAdminBuying(buyResponse.Data?.Reason === 'Admins can buy spots regardless of time window');
    } catch (error) {
      console.error('Failed to check buy/sell permissions:', error);
    } finally {
      setIsLoading(false);
    }
  }, [session.SessionId]);

  useEffect(() => {
    checkPermissions();
  }, [checkPermissions]);

  const buyActionState = buyStatus?.BuyActionState;

  const getBuyWindowDate = (): string | undefined => {
    if (user?.PreferredPlus) {
      return session.BuyWindowPreferredPlus;
    } else if (user?.Preferred) {
      return session.BuyWindowPreferred;
    }
    return session.BuyWindow;
  };

  // Window times are Pacific wall-clock (parsed with moment.utc for display). Compare against the *current*
  // Pacific wall-clock in the same naive frame so a future window isn't reported as already open.
  const nowPacificWallClock = moment.utc(moment().tz('America/Los_Angeles').format('YYYY-MM-DDTHH:mm:ss'));
  const buyWindowOpen = nowPacificWallClock.isSameOrAfter(moment.utc(getBuyWindowDate()));
  const buyWindowDate = moment.utc(getBuyWindowDate()).format('dddd, MM/DD/yyyy, HH:mm');

  const getLotteryDrawTime = (lotteryClass?: LotteryClass | null): string | undefined => {
    switch (lotteryClass) {
      case LotteryClass.PreferredPlus:
        return session.LotteryDrawPreferredPlus;
      case LotteryClass.Preferred:
        return session.LotteryDrawPreferred;
      case LotteryClass.Standard:
        return session.LotteryDrawStandard;
      default:
        return undefined;
    }
  };

  const refreshAfterAction = async (): Promise<void> => {
    const { data } = await refetch();
    if (data?.Session) {
      onSessionUpdate(data.Session);
    }
    await checkPermissions();
  };

  const showError = (error: unknown, fallback: string): void => {
    const errorMessage =
      (error as { response?: { data: { Message: string } } }).response?.data?.Message ?? fallback;
    notifications.show({
      position: 'top-center',
      autoClose: 5000,
      style: { marginTop: '60px' },
      title: 'Error',
      message: errorMessage,
      color: 'red',
    });
  };

  const showSuccess = (message: string | null | undefined): void => {
    notifications.show({
      position: 'top-center',
      autoClose: 5000,
      style: { marginTop: '60px' },
      title: 'Success',
      message,
      color: 'green',
    });
  };

  const handleBuy = async (): Promise<void> => {
    if (isTransacting) return;
    try {
      setIsTransacting(true);
      const response = await buySellService.buySpot({
        SessionId: session.SessionId,
        Note: note,
      });
      await refreshAfterAction();
      showSuccess(response.Message);
      setBuyModalOpen(false);
      setNote('');
    } catch (error) {
      console.error('Failed to buy transaction:', error);
      showError(error, 'Failed to buy transaction');
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
      await refreshAfterAction();
      showSuccess(response.Message);
      setSellModalOpen(false);
      setNote('');
    } catch (error) {
      console.error('Failed to sell transaction:', error);
      showError(error, 'Failed to sell transaction');
    } finally {
      setIsTransacting(false);
    }
  };

  const handleEnterLottery = async (): Promise<void> => {
    if (isTransacting) return;
    try {
      setIsTransacting(true);
      const response = await buySellService.lotteryEnter(session.SessionId ?? 0);
      await refreshAfterAction();
      showSuccess(response.Message);
    } catch (error) {
      console.error('Failed to enter lottery:', error);
      showError(error, 'Failed to enter lottery');
    } finally {
      setIsTransacting(false);
    }
  };

  const handleLeaveLottery = async (): Promise<void> => {
    if (isTransacting) return;
    try {
      setIsTransacting(true);
      const response = await buySellService.lotteryWithdraw(session.SessionId ?? 0);
      await refreshAfterAction();
      showSuccess(response.Message);
    } catch (error) {
      console.error('Failed to leave lottery:', error);
      showError(error, 'Failed to leave lottery');
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
        {buyActionState === BuyActionState.InLottery && (
          <Group mt='xs'>
            <Text c='blue' fw={600}>
              You&apos;re in the {buyStatus?.LotteryClass} lottery — Draw at{' '}
              {moment.utc(getLotteryDrawTime(buyStatus?.LotteryClass)).format('dddd, MM/DD/yyyy, HH:mm')}
            </Text>
          </Group>
        )}
        <Group justify='left' mt='sm'>
          {buyActionState === BuyActionState.BuyNow && (
            <Button onClick={() => setBuyModalOpen(true)} color='green' loading={isTransacting}>
              {isAdminBuying ? 'Buy Spot (Admin)' : 'Buy Spot'}
            </Button>
          )}
          {buyActionState === BuyActionState.EnterLottery && (
            <Button onClick={handleEnterLottery} color='blue' loading={isTransacting}>
              Enter Lottery
            </Button>
          )}
          {buyActionState === BuyActionState.InLottery && (
            <Button onClick={handleLeaveLottery} variant='outline' color='blue' loading={isTransacting}>
              Leave Lottery
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
