import { VenueLink } from '@/components/VenueLink';
import { useCountdown } from '@/hooks/useCountdown';
import { GoalieSession } from '@/lib/goalies';
import { Alert, Badge, Button, Card, Group, Stack, Text, ThemeIcon } from '@mantine/core';
import {
  IconAlertTriangle,
  IconCalendar,
  IconClock,
  IconHourglassHigh,
  IconUsers,
} from '@tabler/icons-react';
import moment from 'moment';
import { JSX } from 'react';
import { Link } from 'react-router-dom';
import { GoalieNetChip } from './GoalieNetChip';

interface NextStartSpotlightProps {
  start: GoalieSession;
  image: string;
}

/**
 * The goalie's hero card: their next start.
 *
 * Mirrors the skater spotlight so the dashboard reads as one product, but answers the questions a
 * goalie actually has — am I confirmed, is the other net covered, how full is the skate.
 */
export const NextStartSpotlight = ({ start, image }: NextStartSpotlightProps): JSX.Element => {
  const { session, otherGoalieNames, openNets, skaters } = start;
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
        border: '1px solid var(--mantine-color-teal-7)',
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

          <GoalieNetChip />

          <Group gap='sm' wrap='wrap'>
            {skaters && (
              <Badge
                size='lg'
                radius='sm'
                variant='light'
                color='gray'
                leftSection={<IconUsers size={14} />}
              >
                {skaters.filled}/{skaters.total} skaters
              </Badge>
            )}
            {otherGoalieNames.length > 0 && (
              <Badge size='lg' radius='sm' variant='light' color='teal'>
                Other goalie: {otherGoalieNames.join(', ')}
              </Badge>
            )}
          </Group>

          <Group gap='xs' wrap='nowrap'>
            <ThemeIcon color='purple' variant='light' radius='md' size='lg'>
              <IconHourglassHigh size={20} />
            </ThemeIcon>
            <Text size='xl' fw={700} c='purple.3'>
              Puck drops in {countdown}
            </Text>
          </Group>

          {openNets > 0 && (
            <Alert
              color='yellow'
              variant='light'
              radius='md'
              p='sm'
              icon={<IconAlertTriangle size={18} />}
            >
              <Text size='sm'>
                The other net has no goalie listed yet. You may be the only one showing up.
              </Text>
            </Alert>
          )}

          <VenueLink size='md' iconSize={20} />

          <Button
            component={Link}
            to={`/session/${session.SessionId}`}
            size='md'
            radius='md'
            color='teal'
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
