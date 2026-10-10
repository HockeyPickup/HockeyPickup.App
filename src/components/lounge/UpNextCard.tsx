import { GoalieAvatar } from '@/components/GoalieAvatar';
import { SessionBasicResponse } from '@/HockeyPickup.Api';
import { useCountdown } from '@/hooks/useCountdown';
import { getSessionGoalies, goalieName, isUserInNet, openNets } from '@/lib/goalies';
import { sessionMoment } from '@/lib/pacificTime';
import { Badge, Box, Card, Group, Stack, Text, Title } from '@mantine/core';
import { IconAlertTriangle, IconHourglassHigh, IconShieldCheck } from '@tabler/icons-react';
import { JSX } from 'react';
import { Link } from 'react-router-dom';
import { LoungeScene } from './LoungeScene';
import { OpenNetAvatar } from './OpenNetAvatar';

const FACE_SIZE = 64;
const MAX_OPEN_LISTED = 4;

const linkStyle = { textDecoration: 'none', color: 'inherit' };

const CreaseSlots = ({ session }: { session: SessionBasicResponse }): JSX.Element => (
  <Group gap='lg' wrap='wrap'>
    {getSessionGoalies(session).map((goalie) => (
      <Link key={goalie.UserId} to={`/profile/${goalie.UserId}`} style={linkStyle}>
        <Stack gap={6} align='center' w={112}>
          <GoalieAvatar goalie={goalie} size={FACE_SIZE} />
          <Text size='sm' fw={600} ta='center' lh={1.2}>
            {goalieName(goalie)}
          </Text>
        </Stack>
      </Link>
    ))}
    {Array.from({ length: openNets(session) }, (_, index) => (
      <Stack key={`open-${index}`} gap={6} align='center' w={112}>
        <OpenNetAvatar size={FACE_SIZE} />
        <Text size='sm' fw={600} c='orange.4'>
          Open net
        </Text>
      </Stack>
    ))}
  </Group>
);

/** Every upcoming net covered, or which skates still need someone. */
const NetStatus = ({ upcoming }: { upcoming: SessionBasicResponse[] }): JSX.Element => {
  const needy = upcoming.filter((session) => openNets(session) > 0);
  const last = upcoming[upcoming.length - 1];

  if (needy.length === 0) {
    return (
      <Group gap={6} wrap='nowrap'>
        <IconShieldCheck size={18} color='var(--mantine-color-teal-4)' />
        <Text size='sm' c='teal.3'>
          Every net covered through {sessionMoment(last.SessionDate).format('ddd, MMM D')}
        </Text>
      </Group>
    );
  }

  return (
    <Group gap='xs' wrap='wrap'>
      <Group gap={6} wrap='nowrap'>
        <IconAlertTriangle size={18} color='var(--mantine-color-orange-4)' />
        <Text size='sm' fw={600} c='orange.3'>
          {needy.length} {needy.length === 1 ? 'skate needs' : 'skates need'} a goalie:
        </Text>
      </Group>
      {needy.slice(0, MAX_OPEN_LISTED).map((session) => (
        <Badge
          key={session.SessionId}
          component={Link}
          to={`/session/${session.SessionId}`}
          color='orange'
          variant='light'
          radius='sm'
          style={{ cursor: 'pointer' }}
        >
          {sessionMoment(session.SessionDate).format('ddd, MMM D')}
        </Badge>
      ))}
      {needy.length > MAX_OPEN_LISTED && (
        <Text size='xs' c='dimmed'>
          +{needy.length - MAX_OPEN_LISTED} more
        </Text>
      )}
    </Group>
  );
};

interface UpNextCardProps {
  upcoming: SessionBasicResponse[];
  viewerId: string | undefined;
}

/**
 * The lounge's marquee: the very next skate, who is in its nets, and whether any upcoming net is
 * still open. If the viewer is a goalie whose next start is further out, that is called out too.
 */
export const UpNextCard = ({ upcoming, viewerId }: UpNextCardProps): JSX.Element => {
  const next: SessionBasicResponse | undefined = upcoming[0];
  const countdown = useCountdown(next?.SessionDate);
  const viewerNext = upcoming.find((session) => isUserInNet(session, viewerId));
  const when = next ? sessionMoment(next.SessionDate) : null;

  return (
    <Card
      shadow='sm'
      radius='md'
      withBorder
      style={{
        background:
          'linear-gradient(135deg, var(--mantine-color-dark-7) 0%, var(--mantine-color-dark-6) 60%, rgba(110, 60, 188, 0.18) 100%)',
        border: '1px solid var(--mantine-color-dark-4)',
      }}
    >
      {/* Inner padding: the global Paper rule pins every Card's own padding to 4px. */}
      <Group justify='space-between' align='center' gap='lg' wrap='wrap' p={{ base: 'sm', sm: 'lg' }}>
        <Stack gap='md' style={{ flex: 1, minWidth: 260 }}>
          <Group gap='sm' wrap='wrap'>
            <Text size='xs' fw={700} c='purple.3' style={{ letterSpacing: '0.2em', textTransform: 'uppercase' }}>
              Up next
            </Text>
            {next && (
              <Badge color='purple' variant='light' radius='sm' leftSection={<IconHourglassHigh size={12} />}>
                Puck drops in {countdown}
              </Badge>
            )}
          </Group>

          {next && when ? (
            <>
              <Link to={`/session/${next.SessionId}`} style={linkStyle}>
                <Title order={2} style={{ lineHeight: 1.1, letterSpacing: '-0.01em' }}>
                  {when.format('dddd, MMMM D')}
                </Title>
                <Text c='dimmed' fw={500} mt={4}>
                  {when.format('h:mmA')} – {when.clone().add(1, 'hour').format('h:mmA')}
                </Text>
              </Link>
              <CreaseSlots session={next} />
              {viewerNext && viewerNext.SessionId !== next.SessionId && (
                <Text size='sm' c='teal.3'>
                  Your next start:{' '}
                  <Link to={`/session/${viewerNext.SessionId}`} style={{ color: 'inherit', fontWeight: 600 }}>
                    {sessionMoment(viewerNext.SessionDate).format('ddd, MMM D · h:mmA')}
                  </Link>
                </Text>
              )}
              <NetStatus upcoming={upcoming} />
            </>
          ) : (
            <Title order={3}>No skates on the schedule yet.</Title>
          )}
        </Stack>

        <Box w={{ base: '100%', sm: 320 }} maw={320} mx={{ base: 'auto', sm: 0 }}>
          <LoungeScene />
        </Box>
      </Group>
    </Card>
  );
};
