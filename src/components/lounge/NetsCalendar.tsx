import { GoalieAvatar } from '@/components/GoalieAvatar';
import { SessionBasicResponse } from '@/HockeyPickup.Api';
import { isCancelled } from '@/lib/dashboard';
import { GOALIES_PER_SESSION, getSessionGoalies, goalieName, isUserInNet, openNets } from '@/lib/goalies';
import { LoungeGoalie, dayKey, monthGridDays } from '@/lib/lounge';
import { nowPacific, sessionMoment } from '@/lib/pacificTime';
import {
  ActionIcon,
  Anchor,
  Avatar,
  Badge,
  Box,
  Button,
  Group,
  Paper,
  Stack,
  Text,
  Title,
  Tooltip,
  UnstyledButton,
} from '@mantine/core';
import { IconCalendarPlus, IconChevronLeft, IconChevronRight, IconQuestionMark } from '@tabler/icons-react';
import { Moment } from 'moment-timezone';
import { CSSProperties, JSX, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { OpenNetAvatar } from './OpenNetAvatar';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const OPEN_NETS = 'open';

/** Nobody spotlit, one goalie by UserId, or every skate with an open net. */
type Spotlight = string | null;

const matchesSpotlight = (session: SessionBasicResponse, spotlight: Spotlight): boolean =>
  spotlight === OPEN_NETS ? openNets(session) > 0 : isUserInNet(session, spotlight ?? undefined);

const shortName = (goalie: { FirstName: string; LastName: string }): string =>
  `${goalie.FirstName} ${goalie.LastName.charAt(0)}.`;

const describe = (session: SessionBasicResponse): string => {
  const names = getSessionGoalies(session).map(goalieName);
  const open = openNets(session);
  const nets = [...names, ...(open > 0 ? [`${open} open ${open === 1 ? 'net' : 'nets'}`] : [])];
  return `${sessionMoment(session.SessionDate).format('dddd, MMMM D, h:mmA')}: ${nets.join(', ')}`;
};

interface SessionTileProps {
  session: SessionBasicResponse;
  now: Moment;
  spotlight: Spotlight;
  viewerId: string | undefined;
}

const SessionTile = ({ session, now, spotlight, viewerId }: SessionTileProps): JSX.Element => {
  const isPast = !sessionMoment(session.SessionDate).isAfter(now);
  const goalies = getSessionGoalies(session);
  const open = openNets(session);
  const cancelled = isCancelled(session);
  const lit = spotlight !== null && matchesSpotlight(session, spotlight);
  const viewerInNet = isUserInNet(session, viewerId);

  let ring: string | undefined;
  if (lit) ring = spotlight === OPEN_NETS ? 'orange-5' : 'teal-4';
  else if (spotlight === null && viewerInNet) ring = 'teal-7';

  let opacity = 1;
  if (spotlight !== null && !lit) opacity = 0.2;
  else if (isPast || cancelled) opacity = 0.5;

  const style: CSSProperties = {
    display: 'block',
    textDecoration: 'none',
    color: 'inherit',
    opacity,
    transition: 'opacity 150ms ease, box-shadow 150ms ease',
    background: 'var(--mantine-color-dark-6)',
    borderRadius: 'var(--mantine-radius-sm)',
    borderTop: `3px solid ${open > 0 && !cancelled && !isPast ? 'var(--mantine-color-orange-6)' : 'var(--mantine-color-dark-4)'}`,
    boxShadow: ring ? `0 0 0 2px var(--mantine-color-${ring})` : undefined,
  };

  return (
    <Box component={Link} to={`/session/${session.SessionId}`} aria-label={describe(session)} p={4} style={style}>
      <Text size='10px' c='dimmed' fw={600} visibleFrom='sm' lh={1.2}>
        {cancelled ? 'Cancelled' : sessionMoment(session.SessionDate).format('h:mmA')}
      </Text>
      {!cancelled && (
        <>
          {/* Phones: faces only, overlapped. */}
          <Avatar.Group spacing={8} hiddenFrom='md' mt={2}>
            {goalies.map((goalie) => (
              <GoalieAvatar key={goalie.UserId} goalie={goalie} size={20} />
            ))}
            {Array.from({ length: open }, (_, index) => (
              <OpenNetAvatar key={`open-${index}`} size={20} />
            ))}
          </Avatar.Group>
          {/* Wider screens: face and name per net. */}
          <Stack gap={3} visibleFrom='md' mt={4}>
            {goalies.map((goalie) => (
              <Group key={goalie.UserId} gap={5} wrap='nowrap'>
                <GoalieAvatar goalie={goalie} size={22} />
                <Text size='xs' fw={500} truncate>
                  {shortName(goalie)}
                </Text>
              </Group>
            ))}
            {Array.from({ length: open }, (_, index) => (
              <Group key={`open-${index}`} gap={5} wrap='nowrap'>
                <OpenNetAvatar size={22} />
                <Text size='xs' fw={600} c='orange.4'>
                  Open
                </Text>
              </Group>
            ))}
          </Stack>
        </>
      )}
    </Box>
  );
};

interface DayCellProps {
  day: Moment;
  inMonth: boolean;
  isToday: boolean;
  now: Moment;
  sessions: SessionBasicResponse[];
  spotlight: Spotlight;
  viewerId: string | undefined;
}

const DayCell = ({ day, inMonth, isToday, now, sessions, spotlight, viewerId }: DayCellProps): JSX.Element => (
  <Box
    mih={{ base: 62, md: 104 }}
    p={4}
    style={{
      borderRadius: 'var(--mantine-radius-sm)',
      background: inMonth ? 'var(--mantine-color-dark-7)' : 'transparent',
      border: `1px solid ${inMonth ? 'var(--mantine-color-dark-5)' : 'transparent'}`,
      minWidth: 0,
    }}
  >
    <Box
      w={20}
      h={20}
      mb={4}
      style={{
        display: 'grid',
        placeItems: 'center',
        borderRadius: '50%',
        background: isToday ? 'var(--mantine-color-blue-6)' : undefined,
      }}
    >
      <Text size='xs' fw={isToday ? 800 : 600} c={isToday ? 'dark.9' : inMonth ? 'gray.4' : 'dark.3'}>
        {day.date()}
      </Text>
    </Box>
    <Stack gap={4}>
      {sessions.map((session) => (
        <SessionTile
          key={session.SessionId}
          session={session}
          now={now}
          spotlight={spotlight}
          viewerId={viewerId}
        />
      ))}
    </Stack>
  </Box>
);

const SpotlightChip = ({
  label,
  active,
  onClick,
  children,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  children: JSX.Element;
}): JSX.Element => (
  <Tooltip label={label} withArrow openDelay={200}>
    <UnstyledButton
      onClick={onClick}
      aria-pressed={active}
      aria-label={`Spotlight ${label}`}
      style={{
        borderRadius: '50%',
        lineHeight: 0,
        padding: 2,
        boxShadow: active ? '0 0 0 2px var(--mantine-color-teal-4)' : 'none',
        opacity: active ? 1 : 0.75,
      }}
    >
      {children}
    </UnstyledButton>
  </Tooltip>
);

interface NetsCalendarProps {
  /** Every dated session, past and future, cancelled included. */
  sessions: SessionBasicResponse[];
  goalies: LoungeGoalie[];
  viewerId: string | undefined;
}

/**
 * A month of nets at a glance: faces on every skate day, open nets marked in orange.
 * Spotlight a goalie (or "open nets") to fade every other skate.
 */
export const NetsCalendar = ({ sessions, goalies, viewerId }: NetsCalendarProps): JSX.Element => {
  const now = nowPacific();
  const thisMonth = now.clone().startOf('month');
  const [month, setMonth] = useState<Moment>(thisMonth);
  const [spotlight, setSpotlight] = useState<Spotlight>(null);

  const byDay = useMemo(() => {
    const map = new Map<string, SessionBasicResponse[]>();
    for (const session of sessions) {
      const key = dayKey(sessionMoment(session.SessionDate));
      map.set(key, [...(map.get(key) ?? []), session]);
    }
    return map;
  }, [sessions]);

  // Navigation spans every month with a session, and always this one.
  const sessionMonths = useMemo(
    () => sessions.map((session) => sessionMoment(session.SessionDate).startOf('month')),
    [sessions],
  );
  const first = sessionMonths.reduce((min, m) => (m.isBefore(min) ? m : min), thisMonth);
  const last = sessionMonths.reduce((max, m) => (m.isAfter(max) ? m : max), thisMonth);

  const days = monthGridDays(month);
  const todayKey = dayKey(now);
  const monthSessions = sessions.filter(
    (session) => sessionMoment(session.SessionDate).isSame(month, 'month') && !isCancelled(session),
  );
  const totalNets = monthSessions.length * GOALIES_PER_SESSION;
  const coveredNets = totalNets - monthSessions.reduce((sum, session) => sum + openNets(session), 0);

  const toggle = (value: string): void => setSpotlight((current) => (current === value ? null : value));

  return (
    <Paper shadow='sm' p='md'>
      <Group justify='space-between' align='center' mb='xs' wrap='nowrap' gap='sm'>
        <Title order={3}>Nets Calendar</Title>
        <Anchor component={Link} to='/calendar' size='sm'>
          <Group gap={4} wrap='nowrap'>
            <IconCalendarPlus size={16} />
            Subscribe
          </Group>
        </Anchor>
      </Group>

      <Group gap='xs' mb='sm' wrap='wrap'>
        <Group gap={4} wrap='nowrap'>
          <ActionIcon
            variant='subtle'
            color='gray'
            aria-label='Previous month'
            disabled={!month.isAfter(first, 'month')}
            onClick={() => setMonth(month.clone().subtract(1, 'month'))}
          >
            <IconChevronLeft size={18} />
          </ActionIcon>
          <Text fw={700} w={150} ta='center' style={{ whiteSpace: 'nowrap' }}>
            {month.format('MMMM YYYY')}
          </Text>
          <ActionIcon
            variant='subtle'
            color='gray'
            aria-label='Next month'
            disabled={!month.isBefore(last, 'month')}
            onClick={() => setMonth(month.clone().add(1, 'month'))}
          >
            <IconChevronRight size={18} />
          </ActionIcon>
        </Group>
        <Text size='sm' c='dimmed'>
          {monthSessions.length} {monthSessions.length === 1 ? 'skate' : 'skates'}
          {totalNets > 0 && ` · ${coveredNets}/${totalNets} nets covered`}
        </Text>
        {!month.isSame(thisMonth, 'month') && (
          <Button size='compact-xs' variant='subtle' onClick={() => setMonth(thisMonth)}>
            Today
          </Button>
        )}
      </Group>

      <Group gap={6} mb='md' wrap='wrap'>
        <Text size='xs' fw={700} c='dimmed' tt='uppercase' mr={4} style={{ letterSpacing: '0.12em' }}>
          Spotlight
        </Text>
        {goalies.map(({ user }) => (
          <SpotlightChip
            key={user.Id}
            label={`${user.FirstName} ${user.LastName}`}
            active={spotlight === user.Id}
            onClick={() => toggle(user.Id)}
          >
            <GoalieAvatar
              goalie={{ FirstName: user.FirstName ?? '', LastName: user.LastName ?? '', PhotoUrl: user.PhotoUrl }}
              size={30}
            />
          </SpotlightChip>
        ))}
        <SpotlightChip label='Open nets' active={spotlight === OPEN_NETS} onClick={() => toggle(OPEN_NETS)}>
          <Avatar size={30} radius='xl' color='orange' variant='light'>
            <IconQuestionMark size={16} />
          </Avatar>
        </SpotlightChip>
        {spotlight !== null && (
          <Badge
            component='button'
            onClick={() => setSpotlight(null)}
            variant='light'
            color='gray'
            radius='sm'
            style={{ cursor: 'pointer', border: 0 }}
          >
            Clear
          </Badge>
        )}
      </Group>

      <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: 4 }}>
        {WEEKDAYS.map((weekday) => (
          <Text key={weekday} size='xs' fw={700} c='dimmed' ta='center' tt='uppercase' pb={2}>
            {weekday.charAt(0)}
            <Box component='span' visibleFrom='sm'>
              {weekday.slice(1)}
            </Box>
          </Text>
        ))}
        {days.map((day) => {
          const key = dayKey(day);
          return (
            <DayCell
              key={key}
              day={day}
              inMonth={day.isSame(month, 'month')}
              isToday={key === todayKey}
              now={now}
              sessions={byDay.get(key) ?? []}
              spotlight={spotlight}
              viewerId={viewerId}
            />
          );
        })}
      </Box>
    </Paper>
  );
};
