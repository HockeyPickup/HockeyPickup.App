import { GoalieSession } from '@/lib/goalies';
import { Anchor, Badge, Card, Group, Stack, Text } from '@mantine/core';
import moment from 'moment';
import { JSX } from 'react';
import { Link } from 'react-router-dom';
import { GoalieNetChip } from './GoalieNetChip';

interface UpcomingStartsProps {
  items: GoalieSession[];
}

/** The goalie's remaining booked starts. Density over decoration, as with the skater list. */
export const UpcomingStarts = ({ items }: UpcomingStartsProps): JSX.Element => (
  <Stack gap='xs'>
    {items.map(({ session, otherGoalieNames, openNets, skaters }) => (
      <Card key={session.SessionId} radius='md' p='sm' withBorder bg='dark.6'>
        <Group justify='space-between' wrap='wrap' gap='sm'>
          <Stack gap={2} style={{ minWidth: 0 }}>
            <Text size='sm' fw={600}>
              {moment.utc(session.SessionDate).format('ddd, MMM D')}
              <Text component='span' c='dimmed' fw={400} ml={8}>
                {moment.utc(session.SessionDate).format('h:mmA')}
              </Text>
            </Text>
            <Text size='xs' c='dimmed'>
              {otherGoalieNames.length > 0
                ? `Other goalie: ${otherGoalieNames.join(', ')}`
                : 'Other net unfilled'}
            </Text>
          </Stack>
          <Group gap='sm' wrap='nowrap'>
            {skaters && (
              <Text size='xs' c='dimmed'>
                {skaters.filled}/{skaters.total}
              </Text>
            )}
            {openNets > 0 && (
              <Badge size='sm' radius='sm' variant='light' color='yellow'>
                Net open
              </Badge>
            )}
            <GoalieNetChip variant='compact' />
            <Anchor component={Link} to={`/session/${session.SessionId}`} size='sm' fw={600}>
              View
            </Anchor>
          </Group>
        </Group>
      </Card>
    ))}
  </Stack>
);
