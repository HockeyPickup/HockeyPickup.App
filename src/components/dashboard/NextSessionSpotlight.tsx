import { VenueLink } from '@/components/VenueLink';
import { useCountdown } from '@/hooks/useCountdown';
import { getPlayingCount } from '@/lib/dashboard';
import { DashboardRosterPlayer, DashboardSession } from '@/types/graphql';
import { Badge, Button, Card, Group, Stack, Text, ThemeIcon } from '@mantine/core';
import { IconCalendar, IconClock, IconHourglassHigh, IconUsers } from '@tabler/icons-react';
import moment from 'moment';
import { JSX } from 'react';
import { Link } from 'react-router-dom';
import { TeamIdentityChip } from './TeamIdentityChip';

interface NextSessionSpotlightProps {
  session: DashboardSession;
  rosterEntry: DashboardRosterPlayer;
  image: string;
}

/**
 * The hero card: the next session this player is actually rostered on.
 *
 * Everything here answers "what do I need to know before I show up" — when, where, which bench,
 * which position, and how long I've got.
 */
export const NextSessionSpotlight = ({
  session,
  rosterEntry,
  image,
}: NextSessionSpotlightProps): JSX.Element => {
  const countdown = useCountdown(session.SessionDate);
  const sessionDate = moment.utc(session.SessionDate);

  return (
    <Card
      shadow='sm'
      radius='md'
      p='lg'
      withBorder
      style={{
        background:
          'linear-gradient(45deg, var(--mantine-color-dark-7), var(--mantine-color-dark-6))',
        border: '1px solid var(--mantine-color-purple-6)',
      }}
    >
      <Group align='flex-start' justify='space-between' wrap='wrap' gap='lg'>
        <Stack gap='md' style={{ flex: 1, minWidth: 280 }}>
          <Stack gap={2}>
            <Group gap='xs' wrap='nowrap'>
              <IconCalendar size={20} style={{ color: '#909296' }} />
              <Text size='lg' c='gray.3'>
                {sessionDate.format('dddd, MMMM Do, YYYY')}
              </Text>
            </Group>
            <Group gap='xs' wrap='nowrap'>
              <IconClock size={20} style={{ color: '#909296' }} />
              <Text size='lg' c='gray.3'>
                {sessionDate.format('h:mmA')} - {sessionDate.clone().add(1, 'hour').format('h:mmA')}
              </Text>
            </Group>
          </Stack>

          <TeamIdentityChip team={rosterEntry.TeamAssignment} />

          <Group gap='sm' wrap='wrap'>
            <Badge size='lg' radius='sm' variant='light' color='blue'>
              {rosterEntry.CurrentPosition}
            </Badge>
            <Badge
              size='lg'
              radius='sm'
              variant='light'
              color='gray'
              leftSection={<IconUsers size={14} />}
            >
              {getPlayingCount(session)} playing
            </Badge>
          </Group>

          <Group gap='xs' wrap='nowrap'>
            <ThemeIcon color='purple' variant='light' radius='md' size='lg'>
              <IconHourglassHigh size={20} />
            </ThemeIcon>
            <Text size='xl' fw={700} c='purple.3'>
              Puck drops in {countdown}
            </Text>
          </Group>

          {session.Note && (
            <Text size='md' fw={600} c='white'>
              {session.Note}
            </Text>
          )}

          <VenueLink size='md' iconSize={20} />

          <Button
            component={Link}
            to={`/session/${session.SessionId}`}
            size='md'
            radius='md'
            color='purple'
            style={{ width: 200 }}
          >
            View Session
          </Button>
        </Stack>

        <img
          src={image}
          alt='Hockey players in action'
          style={{
            width: '100%',
            maxWidth: 380,
            height: 240,
            objectFit: 'cover',
            borderRadius: 'var(--mantine-radius-md)',
          }}
        />
      </Group>
    </Card>
  );
};
