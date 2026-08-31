import { GoalieSession } from '@/lib/goalies';
import { Badge, Button, Card, Group, SimpleGrid, Stack, Text } from '@mantine/core';
import { IconCalendar, IconUserQuestion, IconUsers } from '@tabler/icons-react';
import moment from 'moment';
import { JSX } from 'react';
import { Link } from 'react-router-dom';

interface NetsToFillProps {
  items: GoalieSession[];
}

/**
 * Upcoming skates still short of a goalie.
 *
 * This is a commissioner's list, not a goalie's: goalies are invited and accept or decline, so a
 * goalie cannot act on an open net and showing it to them would only imply otherwise. It is
 * informational — the invite happens outside the app — so the card links to the session rather
 * than offering an action the Api cannot honour.
 */
export const NetsToFill = ({ items }: NetsToFillProps): JSX.Element => (
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
                {openNets === 1 ? 'Needs 1 goalie' : `Needs ${openNets} goalies`}
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
                ? `Accepted: ${goalieNames.join(', ')}`
                : 'Nobody accepted yet'}
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
