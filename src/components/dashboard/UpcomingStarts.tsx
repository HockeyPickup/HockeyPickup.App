import { GoalieAvatar } from '@/components/GoalieAvatar';
import { GoalieSession, goalieName } from '@/lib/goalies';
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
    {items.map(({ session, otherGoalies, openNets }) => (
      <Card key={session.SessionId} radius='md' p='sm' withBorder bg='dark.6'>
        <Group justify='space-between' wrap='wrap' gap='sm'>
          <Stack gap={2} style={{ minWidth: 0 }}>
            <Text size='sm' fw={600}>
              {moment.utc(session.SessionDate).format('ddd, MMM D')}
              <Text component='span' c='dimmed' fw={400} ml={8}>
                {moment.utc(session.SessionDate).format('h:mmA')}
              </Text>
            </Text>
            {otherGoalies.length > 0 ? (
              <Group gap={6} wrap='nowrap'>
                {otherGoalies.map((goalie) => (
                  <GoalieAvatar key={goalie.UserId} goalie={goalie} size={18} />
                ))}
                <Text size='xs' c='dimmed'>
                  Other goalie: {otherGoalies.map(goalieName).join(', ')}
                </Text>
              </Group>
            ) : (
              <Text size='xs' c='dimmed'>
                Other net unfilled
              </Text>
            )}
          </Stack>
          <Group gap='sm' wrap='nowrap'>
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
