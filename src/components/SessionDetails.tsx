import { LotteryClass, LotteryEntrantStatus, SessionDetailedResponse } from '@/HockeyPickup.Api';
import { useAuth } from '@/lib/auth';
import { ActionIcon, Group, Paper, Text, Title } from '@mantine/core';
import { IconPencil } from '@tabler/icons-react';
import moment from 'moment';
import { JSX } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRatingsVisibility } from './RatingsToggle';

interface SessionDetailsProps {
  session: SessionDetailedResponse;
}

export const SessionDetails = ({ session }: SessionDetailsProps): JSX.Element => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const { showRatings } = useRatingsVisibility();

  // Count active entrants (anyone who entered and did not withdraw) for a tier.
  const entrantCountForClass = (lotteryClass: LotteryClass): number =>
    session.LotteryEntrants?.filter(
      (e) => e.LotteryClass === lotteryClass && e.Status !== LotteryEntrantStatus.Withdrawn,
    ).length ?? 0;

  // Current Pacific wall-clock for comparing against the (Pacific) window times.
  const nowPacificWallClock = moment.utc(moment().tz('America/Los_Angeles').format('YYYY-MM-DDTHH:mm:ss'));
  const isPast = (windowTime: string | undefined): boolean =>
    nowPacificWallClock.isSameOrAfter(moment.utc(windowTime));

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
      <Paper withBorder p='xs' mt='md' bg='rgba(255, 255, 255, 0.05)'>
        <Title order={5} mb='xs'>
          {session.LotteryEnabled ? 'Lottery Windows' : 'Buy Windows'}
        </Title>
        {(
          [
            { label: 'Preferred Plus', lotteryClass: LotteryClass.PreferredPlus, open: session.LotteryEntryOpenPreferredPlus, draw: session.LotteryDrawPreferredPlus },
            { label: 'Preferred', lotteryClass: LotteryClass.Preferred, open: session.LotteryEntryOpenPreferred, draw: session.LotteryDrawPreferred },
            { label: 'Standard', lotteryClass: LotteryClass.Standard, open: session.LotteryEntryOpenStandard, draw: session.LotteryDrawStandard },
          ] as const
        ).map((tier) => {
          if (!session.LotteryEnabled) {
            // Buy window opens at the same instant as the lottery entry window would.
            return (
              <Text key={tier.label} size='sm'>
                <strong>{tier.label}:</strong> {isPast(tier.open) ? 'Opened' : 'Opens'}{' '}
                {moment.utc(tier.open).format('dddd, MM/DD/yyyy, HH:mm')}
              </Text>
            );
          }
          const entrantCount = entrantCountForClass(tier.lotteryClass);
          return (
            <Text key={tier.label} size='sm'>
              <strong>{tier.label}:</strong> Entry {moment.utc(tier.open).format('dddd, MM/DD/yyyy, HH:mm')}:{' '}
              {isPast(tier.draw) ? 'Drew' : 'Draw'} {moment.utc(tier.draw).format('dddd, MM/DD/yyyy, HH:mm')}
              {entrantCount > 0 && `: ${entrantCount} ${entrantCount === 1 ? 'entrant' : 'entrants'}`}
            </Text>
          );
        })}
      </Paper>
    </Paper>
  );
};
