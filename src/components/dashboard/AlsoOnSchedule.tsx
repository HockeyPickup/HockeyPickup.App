import { DashboardRosterPlayer, DashboardSession } from '@/types/graphql';
import { Anchor, Badge, Card, Group, Stack, Text } from '@mantine/core';
import moment from 'moment';
import { JSX } from 'react';
import { Link } from 'react-router-dom';
import { TeamIdentityChip } from './TeamIdentityChip';

export interface RosteredSession {
  session: DashboardSession;
  rosterEntry: DashboardRosterPlayer;
}

interface AlsoOnScheduleProps {
  items: RosteredSession[];
}

/**
 * The rest of the player's rostered games. Density over decoration — no photos, one row each,
 * so a busy month stays scannable.
 */
export const AlsoOnSchedule = ({ items }: AlsoOnScheduleProps): JSX.Element => (
  <Stack gap='xs'>
    {items.map(({ session, rosterEntry }) => (
      <Card key={session.SessionId} radius='md' p='sm' withBorder bg='dark.6'>
        <Group justify='space-between' wrap='wrap' gap='sm'>
          <Stack gap={2} style={{ minWidth: 0 }}>
            <Text size='sm' fw={600}>
              {moment.utc(session.SessionDate).format('ddd, MMM D')}
              <Text component='span' c='dimmed' fw={400} ml={8}>
                {moment.utc(session.SessionDate).format('h:mmA')}
              </Text>
            </Text>
            {session.Note && (
              <Text size='xs' c='dimmed' lineClamp={1}>
                {session.Note}
              </Text>
            )}
          </Stack>
          <Group gap='sm' wrap='nowrap'>
            <TeamIdentityChip team={rosterEntry.TeamAssignment} variant='compact' />
            <Badge size='sm' radius='sm' variant='light' color='blue'>
              {rosterEntry.CurrentPosition}
            </Badge>
            <Anchor component={Link} to={`/session/${session.SessionId}`} size='sm' fw={600}>
              View
            </Anchor>
          </Group>
        </Group>
      </Card>
    ))}
  </Stack>
);
