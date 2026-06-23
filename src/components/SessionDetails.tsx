import { LotteryClass, LotteryEntrantStatus, SessionDetailedResponse } from '@/HockeyPickup.Api';
import { useAuth } from '@/lib/auth';
import {
  ActionIcon,
  Badge,
  Box,
  Card,
  Divider,
  Group,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from '@mantine/core';
import {
  IconCircleCheck,
  IconCircleDot,
  IconClock,
  IconConfetti,
  IconCrown,
  IconHourglass,
  IconPencil,
  IconShoppingCart,
  IconStarFilled,
  IconTicket,
  IconUsers,
} from '@tabler/icons-react';
import moment from 'moment';
import { JSX } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRatingsVisibility } from './RatingsToggle';

interface SessionDetailsProps {
  session: SessionDetailedResponse;
}

// One status pill (Upcoming / Open / Drawn) shown per tier card.
interface WindowStatus {
  label: string;
  color: string;
  Icon: typeof IconClock;
}

// A labeled date row inside a tier card: small icon, eyebrow label, time, and a relative-time hint.
interface InfoRowProps {
  icon: JSX.Element;
  label: string;
  value: string;
  hint?: string;
}

const InfoRow = ({ icon, label, value, hint }: InfoRowProps): JSX.Element => (
  <Group gap={10} wrap='nowrap' align='center'>
    <ThemeIcon size={30} radius='md' variant='light' color='gray'>
      {icon}
    </ThemeIcon>
    <Box style={{ minWidth: 0 }}>
      <Text
        fw={700}
        c='dimmed'
        tt='uppercase'
        style={{ fontSize: 10, letterSpacing: 0.4, lineHeight: 1.3 }}
      >
        {label}
      </Text>
      <Text size='sm' fw={600} style={{ lineHeight: 1.25 }}>
        {value}
      </Text>
      {hint && (
        <Text size='xs' c='dimmed' style={{ lineHeight: 1.25 }}>
          {hint}
        </Text>
      )}
    </Box>
  </Group>
);

export const SessionDetails = ({ session }: SessionDetailsProps): JSX.Element => {
  const { isAdmin, user } = useAuth();
  const navigate = useNavigate();
  const { showRatings } = useRatingsVisibility();

  // Count active entrants (anyone who entered and did not withdraw) for a tier.
  const entrantCountForClass = (lotteryClass: LotteryClass): number =>
    session.LotteryEntrants?.filter(
      (e) => e.LotteryClass === lotteryClass && e.Status !== LotteryEntrantStatus.Withdrawn,
    ).length ?? 0;

  // Current Pacific wall-clock for comparing against the (Pacific) window times.
  const nowPacificWallClock = moment.utc(
    moment().tz('America/Los_Angeles').format('YYYY-MM-DDTHH:mm:ss'),
  );
  const isPast = (windowTime: string | undefined): boolean =>
    nowPacificWallClock.isSameOrAfter(moment.utc(windowTime));

  // Compact, friendly formatting for the window times (kept in Pacific wall-clock).
  const fmt = (t: string | undefined): string =>
    t ? moment.utc(t).format('ddd, MMM D · HH:mm') : '—';
  const rel = (t: string | undefined): string => (t ? moment.utc(t).from(nowPacificWallClock) : '');

  // The lottery/buy windows only matter before the session starts (Pacific). Once the session
  // is in the past there's nothing to enter or buy, so hide the whole block.
  const isSessionPast = isPast(session.SessionDate);

  // The viewer's own tier — used to highlight the card that applies to them.
  const userTier: LotteryClass | null = !user
    ? null
    : user.PreferredPlus
      ? LotteryClass.PreferredPlus
      : user.Preferred
        ? LotteryClass.Preferred
        : LotteryClass.Standard;

  const tiers = [
    {
      label: 'Preferred Plus',
      lotteryClass: LotteryClass.PreferredPlus,
      color: 'purple',
      Icon: IconCrown,
      open: session.LotteryEntryOpenPreferredPlus,
      draw: session.LotteryDrawPreferredPlus,
    },
    {
      label: 'Preferred',
      lotteryClass: LotteryClass.Preferred,
      color: 'blue',
      Icon: IconStarFilled,
      open: session.LotteryEntryOpenPreferred,
      draw: session.LotteryDrawPreferred,
    },
    {
      label: 'Standard',
      lotteryClass: LotteryClass.Standard,
      color: 'teal',
      Icon: IconCircleDot,
      open: session.LotteryEntryOpenStandard,
      draw: session.LotteryDrawStandard,
    },
  ] as const;

  const lotteryStatus = (open: string | undefined, draw: string | undefined): WindowStatus => {
    if (isPast(draw)) return { label: 'Drawn', color: 'gray', Icon: IconCircleCheck };
    if (isPast(open)) return { label: 'Entry Open', color: 'green', Icon: IconTicket };
    return { label: 'Upcoming', color: 'yellow', Icon: IconHourglass };
  };

  const buyStatus = (open: string | undefined): WindowStatus =>
    isPast(open)
      ? { label: 'Open Now', color: 'green', Icon: IconCircleCheck }
      : { label: 'Upcoming', color: 'yellow', Icon: IconHourglass };

  return (
    <Paper shadow='sm' p='md'>
      <Paper withBorder p='xs' bg='rgba(255, 255, 255, 0.05)'>
        <Group justify='space-between' mb='md'>
          <Group>
            <Title order={3}>
              {moment.utc(session.SessionDate).format('dddd, MM/DD/yyyy, HH:mm')}
            </Title>
            {isAdmin() && showRatings && (
              <ActionIcon
                variant='subtle'
                onClick={() => navigate(`/sessions/${session.SessionId}/edit`)}
                size='sm'
              >
                <IconPencil size={16} />
              </ActionIcon>
            )}
          </Group>
        </Group>
        <Group>
          <Text style={{ whiteSpace: 'pre-wrap' }}>{session.Note ?? ''}</Text>
        </Group>
      </Paper>
      {!isSessionPast && (
        <Paper withBorder p='md' mt='md' bg='rgba(255, 255, 255, 0.05)'>
          <Group gap='sm' mb='md' align='center' wrap='nowrap'>
            <ThemeIcon
              color={session.LotteryEnabled ? 'purple' : 'green'}
              variant='light'
              radius='md'
              size='lg'
            >
              {session.LotteryEnabled ? <IconTicket size={20} /> : <IconShoppingCart size={20} />}
            </ThemeIcon>
            <Box>
              <Title order={5} style={{ lineHeight: 1.15 }}>
                {session.LotteryEnabled ? 'Lottery Windows' : 'Buy Windows'}
              </Title>
              <Text size='xs' c='dimmed' style={{ lineHeight: 1.25 }}>
                {session.LotteryEnabled
                  ? 'Enter during your tier’s window — spots are drawn at the time shown'
                  : 'Spots open for purchase at your tier’s window'}
              </Text>
            </Box>
          </Group>

          <SimpleGrid cols={{ base: 1, sm: 3 }} spacing='sm'>
            {tiers.map((tier) => {
              const status = session.LotteryEnabled
                ? lotteryStatus(tier.open, tier.draw)
                : buyStatus(tier.open);
              const isYourTier = userTier === tier.lotteryClass;
              const entrantCount = entrantCountForClass(tier.lotteryClass);

              return (
                <Card
                  key={tier.label}
                  withBorder
                  radius='md'
                  p='sm'
                  bg='rgba(255, 255, 255, 0.02)'
                  style={{
                    borderLeftWidth: 3,
                    borderLeftColor: `var(--mantine-color-${tier.color}-${isYourTier ? 4 : 6})`,
                    ...(isYourTier
                      ? {
                          background: `var(--mantine-color-${tier.color}-light)`,
                          boxShadow: `0 0 0 1px var(--mantine-color-${tier.color}-5)`,
                        }
                      : {}),
                  }}
                >
                  <Group justify='space-between' wrap='nowrap' mb='sm'>
                    <Group gap='xs' wrap='nowrap'>
                      <ThemeIcon color={tier.color} variant='light' radius='md' size={36}>
                        <tier.Icon size={20} />
                      </ThemeIcon>
                      <Box>
                        <Text fw={700} size='sm' style={{ lineHeight: 1.2 }}>
                          {tier.label}
                        </Text>
                        {isYourTier && (
                          <Text
                            fw={700}
                            c={tier.color}
                            tt='uppercase'
                            style={{ fontSize: 10, letterSpacing: 0.4, lineHeight: 1.3 }}
                          >
                            Your tier
                          </Text>
                        )}
                      </Box>
                    </Group>
                    <Badge
                      color={status.color}
                      variant='light'
                      radius='sm'
                      leftSection={<status.Icon size={12} />}
                    >
                      {status.label}
                    </Badge>
                  </Group>

                  <Stack gap='xs'>
                    {session.LotteryEnabled ? (
                      <>
                        <InfoRow
                          icon={<IconClock size={16} />}
                          label={isPast(tier.open) ? 'Entry Opened' : 'Entry Opens'}
                          value={fmt(tier.open)}
                          hint={rel(tier.open)}
                        />
                        <InfoRow
                          icon={<IconConfetti size={16} />}
                          label={isPast(tier.draw) ? 'Drawn' : 'Draw'}
                          value={fmt(tier.draw)}
                          hint={rel(tier.draw)}
                        />
                        <Divider variant='dashed' my={2} />
                        <Group gap={8} wrap='nowrap'>
                          <IconUsers size={15} style={{ color: 'var(--mantine-color-dimmed)' }} />
                          <Text size='xs' fw={600} c={entrantCount > 0 ? undefined : 'dimmed'}>
                            {entrantCount} {entrantCount === 1 ? 'entrant' : 'entrants'} entered
                          </Text>
                        </Group>
                      </>
                    ) : (
                      <InfoRow
                        icon={<IconClock size={16} />}
                        label={isPast(tier.open) ? 'Opened' : 'Opens'}
                        value={fmt(tier.open)}
                        hint={rel(tier.open)}
                      />
                    )}
                  </Stack>
                </Card>
              );
            })}
          </SimpleGrid>
        </Paper>
      )}
    </Paper>
  );
};
