import {
  BuyActionState,
  BuySellStatusResponse,
  LotteryClass,
  SessionDetailedResponse,
} from '@/HockeyPickup.Api';
import { useAuth } from '@/lib/auth';
import { buySellService } from '@/lib/buysell';
import { GET_SESSION } from '@/lib/queries';
import { useQuery } from '@apollo/client/react';
import { SessionQueryResult } from '@/types/graphql';
import {
  Alert,
  Badge,
  Box,
  Button,
  Group,
  Modal,
  Paper,
  Text,
  Textarea,
  ThemeIcon,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
  IconAlertTriangle,
  IconCircleCheck,
  IconCurrencyDollar,
  IconHourglass,
  IconLogout,
  IconShoppingCart,
  IconTicket,
} from '@tabler/icons-react';
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
      setIsAdminBuying(
        buyResponse.Data?.Reason === 'Admins can buy spots regardless of time window',
      );
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
  const nowPacificWallClock = moment.utc(
    moment().tz('America/Los_Angeles').format('YYYY-MM-DDTHH:mm:ss'),
  );
  const buyWindowDateRaw = getBuyWindowDate();
  const buyWindowOpen = nowPacificWallClock.isSameOrAfter(moment.utc(buyWindowDateRaw));
  const buyWindowDate = moment.utc(buyWindowDateRaw).format('ddd, MMM D · HH:mm');
  const buyWindowRel = moment.utc(buyWindowDateRaw).from(nowPacificWallClock);

  // The viewer's tier — drives the badge color/label, matching the window cards above.
  const tierLabel = user?.PreferredPlus
    ? 'Preferred Plus'
    : user?.Preferred
      ? 'Preferred'
      : 'Standard';
  const tierColor = user?.PreferredPlus ? 'purple' : user?.Preferred ? 'blue' : 'teal';

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

  const isPast = (t?: string): boolean => nowPacificWallClock.isSameOrAfter(moment.utc(t));

  const userTier: LotteryClass = user?.PreferredPlus
    ? LotteryClass.PreferredPlus
    : user?.Preferred
      ? LotteryClass.Preferred
      : LotteryClass.Standard;

  const getLotteryEntryOpenTime = (lotteryClass: LotteryClass): string | undefined => {
    switch (lotteryClass) {
      case LotteryClass.PreferredPlus:
        return session.LotteryEntryOpenPreferredPlus;
      case LotteryClass.Preferred:
        return session.LotteryEntryOpenPreferred;
      default:
        return session.LotteryEntryOpenStandard;
    }
  };

  // The action panel presents as a "Lottery Window" before/during the lottery (until the viewer's
  // tier has been drawn), and becomes the "Buy Window" once drawn — or always, for non-lottery
  // sessions. This keeps "Buy Window" from showing while the lottery is still running.
  const lotteryDrawTime = getLotteryDrawTime(userTier);
  const lotteryPhase = session.LotteryEnabled && !isPast(lotteryDrawTime);
  const panelOpen = lotteryPhase ? isPast(getLotteryEntryOpenTime(userTier)) : buyWindowOpen;

  // Don't repeat the schedule that the Lottery/Buy Windows section above already shows (entry/draw
  // for the lottery, the open time for buy windows). The only time worth restating here is a
  // lottery session's post-draw buy window, which those cards don't display.
  const panel = lotteryPhase
    ? {
        title: 'Lottery Window',
        Icon: IconTicket,
        iconColor: 'purple',
        statusLabel: panelOpen ? 'Entry Open' : 'Upcoming',
        subline: null,
      }
    : {
        title: 'Buy Window',
        Icon: IconShoppingCart,
        iconColor: 'green',
        statusLabel: panelOpen ? 'Open Now' : 'Upcoming',
        subline:
          session.LotteryEnabled && buyWindowDateRaw
            ? `${buyWindowOpen ? 'Opened' : 'Opens'} ${buyWindowDate} · ${buyWindowRel}`
            : null,
      };

  return (
    <div style={{ marginTop: -16 }}>
      <Paper shadow='sm' p='md' style={{ marginTop: 0, marginBottom: 0 }}>
        <Group justify='space-between' wrap='nowrap' gap='sm'>
          <Group gap='sm' wrap='nowrap' style={{ flex: 1, minWidth: 0 }}>
            <ThemeIcon color={panel.iconColor} variant='light' radius='md' size='lg'>
              <panel.Icon size={20} />
            </ThemeIcon>
            <Box style={{ minWidth: 0 }}>
              <Group gap='xs' wrap='nowrap'>
                <Text fw={700} size='sm'>
                  {panel.title}
                </Text>
                <Badge color={tierColor} variant='light' radius='sm' size='sm'>
                  {tierLabel}
                </Badge>
              </Group>
              {panel.subline && (
                <Text size='xs' c='dimmed' style={{ lineHeight: 1.3 }}>
                  {panel.subline}
                </Text>
              )}
            </Box>
          </Group>
          <Badge
            color={panelOpen ? 'green' : 'yellow'}
            variant='light'
            radius='sm'
            leftSection={panelOpen ? <IconCircleCheck size={12} /> : <IconHourglass size={12} />}
          >
            {panel.statusLabel}
          </Badge>
        </Group>
        {!user?.Active && (
          <Alert
            mt='md'
            color='yellow'
            variant='light'
            radius='md'
            p='sm'
            icon={<IconAlertTriangle size={18} />}
          >
            <Text size='sm'>
              You must be an Active player to Buy or Sell a spot. Contact the commissioner to
              activate your account.
            </Text>
          </Alert>
        )}
        {buyActionState === BuyActionState.InLottery && (
          <Alert
            mt='md'
            color='blue'
            variant='light'
            radius='md'
            p='sm'
            icon={<IconTicket size={18} />}
          >
            <Text size='sm' fw={600}>
              You&apos;re in the {buyStatus?.LotteryClass} lottery
            </Text>
          </Alert>
        )}
        <Group justify='left' mt='md'>
          {buyActionState === BuyActionState.BuyNow && (
            <Button
              onClick={() => setBuyModalOpen(true)}
              color='green'
              loading={isTransacting}
              leftSection={<IconShoppingCart size={16} />}
            >
              {isAdminBuying ? 'Buy Spot (Admin)' : 'Buy Spot'}
            </Button>
          )}
          {buyActionState === BuyActionState.EnterLottery && (
            <Button
              onClick={handleEnterLottery}
              color='blue'
              loading={isTransacting}
              leftSection={<IconTicket size={16} />}
            >
              Enter Lottery
            </Button>
          )}
          {buyActionState === BuyActionState.InLottery && (
            <Button
              onClick={handleLeaveLottery}
              variant='outline'
              color='blue'
              loading={isTransacting}
              leftSection={<IconLogout size={16} />}
            >
              Leave Lottery
            </Button>
          )}
          {canSellSpot && (
            <Button
              onClick={() => setSellModalOpen(true)}
              color='red'
              loading={isTransacting}
              leftSection={<IconCurrencyDollar size={16} />}
            >
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
