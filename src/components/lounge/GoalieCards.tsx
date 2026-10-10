import { GoalieAvatar } from '@/components/GoalieAvatar';
import { UserDetailedResponse } from '@/HockeyPickup.Api';
import { LoungeGoalie } from '@/lib/lounge';
import { nowPacific, sessionMoment } from '@/lib/pacificTime';
import { Badge, Box, Card, Divider, Group, Paper, SimpleGrid, Stack, Text, Title } from '@mantine/core';
import { JSX } from 'react';
import { Link } from 'react-router-dom';

const NEXT_DATES_SHOWN = 3;

const asPerson = (user: UserDetailedResponse): { FirstName: string; LastName: string; PhotoUrl?: string | null } => ({
  FirstName: user.FirstName ?? '',
  LastName: user.LastName ?? '',
  PhotoUrl: user.PhotoUrl,
});

/** Avatar with a ring: teal for the viewer, the card colour otherwise. */
const RingedFace = ({ user, size, isViewer }: { user: UserDetailedResponse; size: number; isViewer: boolean }): JSX.Element => (
  <Box
    style={{
      borderRadius: '50%',
      border: `3px solid ${isViewer ? 'var(--mantine-color-teal-5)' : 'var(--mantine-color-dark-6)'}`,
      lineHeight: 0,
      width: 'fit-content',
    }}
  >
    <GoalieAvatar goalie={asPerson(user)} size={size} />
  </Box>
);

const Stat = ({ value, label }: { value: number; label: string }): JSX.Element => (
  <Stack gap={0} align='center'>
    <Text fw={800} size='xl' lh={1.1}>
      {value}
    </Text>
    <Text size='10px' c='dimmed' fw={600} tt='uppercase' style={{ letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>
      {label}
    </Text>
  </Stack>
);

/**
 * Trading-card style: the face leads, then what a goalie checks first — when am I next in net.
 * Only the next few dates are listed; "Booked" already carries the full count.
 */
const TradingCard = ({ goalie, isViewer }: { goalie: LoungeGoalie; isViewer: boolean }): JSX.Element => {
  const { user, upcoming, seasonStarts } = goalie;

  return (
    <Card
      component={Link}
      to={`/profile/${user.Id}`}
      radius='md'
      withBorder
      bg='dark.6'
      style={{
        textDecoration: 'none',
        color: 'inherit',
        height: '100%',
        borderColor: isViewer ? 'var(--mantine-color-teal-7)' : undefined,
      }}
    >
      <Stack gap='sm' align='center' px='sm' py='md'>
        <RingedFace user={user} size={80} isViewer={isViewer} />
        <Stack gap={4} align='center'>
          <Text fw={700} size='md' ta='center' lh={1.2}>
            {user.FirstName} {user.LastName}
            {user.JerseyNumber !== 0 && (
              <Text component='span' c='dimmed' fw={500} ml={6}>
                #{user.JerseyNumber}
              </Text>
            )}
          </Text>
          {isViewer && (
            <Badge size='xs' color='teal' variant='light' radius='sm'>
              You
            </Badge>
          )}
        </Stack>
        <Group gap='md' justify='center' wrap='nowrap'>
          <Stat value={upcoming.length} label='Booked' />
          <Divider orientation='vertical' color='dark.4' />
          <Stat value={seasonStarts} label={`${nowPacific().year()} starts`} />
        </Group>
        <Group gap={4} justify='center' wrap='wrap'>
          {upcoming.slice(0, NEXT_DATES_SHOWN).map((session) => (
            <Badge key={session.SessionId} size='sm' radius='sm' variant='light' color='teal' tt='none'>
              {sessionMoment(session.SessionDate).format('ddd M/D')}
            </Badge>
          ))}
        </Group>
      </Stack>
    </Card>
  );
};

const FreeAgentItem = ({ goalie, isViewer }: { goalie: LoungeGoalie; isViewer: boolean }): JSX.Element => (
  <Card
    component={Link}
    to={`/profile/${goalie.user.Id}`}
    radius='md'
    p='xs'
    bg='dark.7'
    withBorder
    style={{ textDecoration: 'none', color: 'inherit' }}
  >
    <Group gap='sm' wrap='nowrap'>
      <RingedFace user={goalie.user} size={44} isViewer={isViewer} />
      <Stack gap={0} style={{ minWidth: 0 }}>
        <Text size='sm' fw={600} truncate>
          {goalie.user.FirstName} {goalie.user.LastName}
          {goalie.user.JerseyNumber !== 0 && (
            <Text component='span' c='dimmed' fw={500} ml={6}>
              #{goalie.user.JerseyNumber}
            </Text>
          )}
        </Text>
        <Text size='xs' c='dimmed'>
          {goalie.seasonStarts} {goalie.seasonStarts === 1 ? 'start' : 'starts'} in {nowPacific().year()}
        </Text>
      </Stack>
    </Group>
  </Card>
);

interface GoalieCardsProps {
  goalies: LoungeGoalie[];
  viewerId: string | undefined;
}

/**
 * Goalies with starts booked get a full card; free agents (nothing booked yet) get a compact row,
 * still face-first.
 */
export const GoalieCards = ({ goalies, viewerId }: GoalieCardsProps): JSX.Element => {
  const rotation = goalies.filter((goalie) => goalie.upcoming.length > 0);
  const freeAgents = goalies.filter((goalie) => goalie.upcoming.length === 0);

  return (
    <Paper shadow='sm' p='md'>
      <Group justify='space-between' align='baseline' mb='md'>
        <Title order={3}>In the Rotation</Title>
        <Text size='sm' c='dimmed'>
          {goalies.length} goalies
        </Text>
      </Group>
      {rotation.length === 0 ? (
        <Text c='dimmed'>No one is booked in net yet.</Text>
      ) : (
        <SimpleGrid cols={{ base: 2, sm: 3, lg: 5 }} spacing='md'>
          {rotation.map((goalie) => (
            <TradingCard key={goalie.user.Id} goalie={goalie} isViewer={goalie.user.Id === viewerId} />
          ))}
        </SimpleGrid>
      )}
      {freeAgents.length > 0 && (
        <>
          <Divider
            my='md'
            color='dark.4'
            labelPosition='left'
            label={
              <Text size='xs' fw={700} c='dimmed' tt='uppercase' style={{ letterSpacing: '0.12em' }}>
                Free agents
              </Text>
            }
          />
          <SimpleGrid cols={{ base: 1, xs: 2, md: 3, lg: 4 }} spacing='sm'>
            {freeAgents.map((goalie) => (
              <FreeAgentItem key={goalie.user.Id} goalie={goalie} isViewer={goalie.user.Id === viewerId} />
            ))}
          </SimpleGrid>
        </>
      )}
    </Paper>
  );
};
