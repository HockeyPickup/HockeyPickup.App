import { GoalieSession } from '@/lib/goalies';
import { Badge, Button, Card, Group, SimpleGrid, Stack, Text } from '@mantine/core';
import { IconCalendar, IconUserQuestion, IconUsers } from '@tabler/icons-react';
import moment from 'moment';
import { JSX } from 'react';
import { Link } from 'react-router-dom';

interface NetsNeedingGoalieProps {
  items: GoalieSession[];
}

/**
 * Upcoming skates short of a goalie that this goalie is not already booked for.
 *
 * Nothing in the app surfaces this today — you would have to read every session note by eye. It
 * is informational: there is no self-serve way to claim a net, so the card links to the session
 * rather than promising an action the Api cannot honour.
 */
export const NetsNeedingGoalie = ({ items }: NetsNeedingGoalieProps): JSX.Element => (
  <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing='md'>
    {items.map(({ session, goalieNames, openNets, skaters }) => (
      <Card
        key={session.SessionId}
        radius='md'
        p='md'
        withBorder
        bg='dark.6'
        style={{ height: '100%' }}
      >
        <Stack gap='sm' justify='space-between' style={{ height: '100%' }}>
          <Stack gap='xs'>
            <Group gap='xs' wrap='nowrap'>
              <IconCalendar size={18} style={{ color: '#909296' }} />
              <Text size='sm' fw={600}>
                {moment.utc(session.SessionDate).format('ddd, MMM D')}
              </Text>
              <Text size='sm' c='dimmed'>
                {moment.utc(session.SessionDate).format('h:mmA')}
              </Text>
            </Group>

            <Group gap='xs' wrap='wrap'>
              <Badge
                size='sm'
                radius='sm'
                variant='light'
                color='yellow'
                leftSection={<IconUserQuestion size={12} />}
              >
                {openNets === 1 ? '1 net open' : `${openNets} nets open`}
              </Badge>
              {skaters && (
                <Badge
                  size='sm'
                  radius='sm'
                  variant='light'
                  color='gray'
                  leftSection={<IconUsers size={12} />}
                >
                  {skaters.filled}/{skaters.total} skaters
                </Badge>
              )}
            </Group>

            <Text size='xs' c='dimmed'>
              {goalieNames.length > 0
                ? `Confirmed: ${goalieNames.join(', ')}`
                : 'No goalie confirmed yet'}
            </Text>
          </Stack>

          <Button
            component={Link}
            to={`/session/${session.SessionId}`}
            size='sm'
            radius='md'
            fullWidth
            color='yellow'
            variant='light'
          >
            View Session
          </Button>
        </Stack>
      </Card>
    ))}
  </SimpleGrid>
);
