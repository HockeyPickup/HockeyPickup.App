import { UserDetailedResponse } from '@/HockeyPickup.Api';
import {
  CTA_PRESENTATION,
  getBuyWindowForUser,
  getOpenSells,
  getSessionCtaState,
  getUserQueueStatus,
  getUserSell,
  SessionCtaState,
} from '@/lib/dashboard';
import { nowPacific } from '@/lib/pacificTime';
import { DashboardSession } from '@/types/graphql';
import { Badge, Button, Card, Group, SimpleGrid, Stack, Text } from '@mantine/core';
import { IconCalendar, IconTag, IconTicket } from '@tabler/icons-react';
import moment from 'moment';
import { JSX } from 'react';
import { Link } from 'react-router-dom';

interface AvailableToBuyProps {
  sessions: DashboardSession[];
  user: UserDetailedResponse;
}

const formatCost = (cost: number | null | undefined): string =>
  cost === null || cost === undefined ? '—' : `$${cost.toFixed(2)}`;

interface BuyCardProps {
  session: DashboardSession;
  user: UserDetailedResponse;
  state: SessionCtaState;
}

/** The line under the button. One place decides it, so each state explains itself exactly once. */
const getHint = (
  session: DashboardSession,
  user: UserDetailedResponse,
  state: SessionCtaState,
): string | null => {
  switch (state) {
    case 'BuyWindowNotOpen':
      return `Opens ${moment.utc(getBuyWindowForUser(session, user)).format('ddd, MMM D · h:mmA')}`;
    case 'InQueue':
      return getUserQueueStatus(session, user.Id);
    case 'SellPending':
      return 'Waiting for a buyer';
    case 'Sold': {
      const buyer = getUserSell(session, user.Id)?.Buyer;
      const name = buyer ? [buyer.FirstName, buyer.LastName].filter(Boolean).join(' ') : null;
      return name ? `Bought by ${name}` : 'Your spot was bought';
    }
    default:
      return null;
  }
};

const BuyCard = ({ session, user, state }: BuyCardProps): JSX.Element => {
  const presentation = CTA_PRESENTATION[state];
  const openSells = getOpenSells(session);
  const sessionDate = moment.utc(session.SessionDate);
  const hint = getHint(session, user, state);

  return (
    <Card radius='md' p='md' withBorder bg='dark.6' style={{ height: '100%' }}>
      <Stack gap='sm' justify='space-between' style={{ height: '100%' }}>
        <Stack gap='xs'>
          <Group gap='xs' wrap='nowrap'>
            <IconCalendar size={18} style={{ color: '#909296' }} />
            <Text size='sm' fw={600}>
              {sessionDate.format('ddd, MMM D')}
            </Text>
            <Text size='sm' c='dimmed'>
              {sessionDate.format('h:mmA')}
            </Text>
          </Group>

          <Group gap='xs' wrap='wrap'>
            <Badge
              size='sm'
              radius='sm'
              variant='light'
              color={openSells.length > 0 ? 'green' : 'gray'}
              leftSection={<IconTicket size={12} />}
            >
              {openSells.length === 0
                ? 'No open spots'
                : `${openSells.length} spot${openSells.length === 1 ? '' : 's'} open`}
            </Badge>
            <Badge
              size='sm'
              radius='sm'
              variant='light'
              color='gray'
              leftSection={<IconTag size={12} />}
            >
              {formatCost(session.Cost)}
            </Badge>
          </Group>

          {session.Note && (
            <Text size='xs' c='dimmed' lineClamp={2}>
              {session.Note}
            </Text>
          )}
        </Stack>

        <Stack gap={4}>
          <Button
            component={Link}
            to={`/session/${session.SessionId}`}
            size='sm'
            radius='md'
            fullWidth
            color={presentation.color}
            variant={presentation.variant}
          >
            {presentation.label}
          </Button>
          {hint && (
            <Text size='xs' c='dimmed' ta='center'>
              {hint}
            </Text>
          )}
        </Stack>
      </Stack>
    </Card>
  );
};

/**
 * Upcoming sessions this player is *not* rostered on.
 *
 * The call to action comes from the state machine in lib/dashboard rather than a pile of inline
 * booleans, so a session that is full, or whose buy window has not opened, says so instead of
 * offering a button that would be rejected. Every card links to the session page — buying itself
 * stays where the notes, queue and confirmations live.
 */
export const AvailableToBuy = ({ sessions, user }: AvailableToBuyProps): JSX.Element => {
  const now = nowPacific();

  return (
    <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing='md'>
      {sessions.map((session) => (
        <BuyCard
          key={session.SessionId}
          session={session}
          user={user}
          state={getSessionCtaState(session, user, now)}
        />
      ))}
    </SimpleGrid>
  );
};
