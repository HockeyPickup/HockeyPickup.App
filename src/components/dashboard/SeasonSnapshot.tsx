import { UserStatsResponse } from '@/HockeyPickup.Api';
import { Anchor, Card, Group, SimpleGrid, Stack, Text } from '@mantine/core';
import moment from 'moment';
import { JSX } from 'react';
import { Link } from 'react-router-dom';

interface SeasonSnapshotProps {
  stats: UserStatsResponse | undefined;
  userId: string;
}

interface StatTile {
  label: string;
  value: string;
  hint?: string;
}

const StatCard = ({ label, value, hint }: StatTile): JSX.Element => (
  <Card radius='md' p='md' withBorder bg='dark.6'>
    <Stack gap={2}>
      <Text size='xs' c='dimmed' tt='uppercase' fw={600}>
        {label}
      </Text>
      <Text size='1.6rem' fw={700} style={{ lineHeight: 1.1 }}>
        {value}
      </Text>
      {hint && (
        <Text size='xs' c='dimmed'>
          {hint}
        </Text>
      )}
    </Stack>
  </Card>
);

/**
 * A snapshot, not the Profile page: five numbers and a way through to the rest.
 *
 * Every tile falls back to a real value rather than blanking — a player with no history sees
 * zeros and an invitation, never `NaN` or an empty card.
 */
export const SeasonSnapshot = ({ stats, userId }: SeasonSnapshotProps): JSX.Element => {
  const currentYear = moment().year();
  const lastYear = currentYear - 1;

  const gamesThisYear = stats?.CurrentYearGamesPlayed ?? 0;
  const gamesLastYear = stats?.PriorYearGamesPlayed ?? 0;
  const bought = stats?.CurrentYearBoughtTotal ?? 0;
  const sold = stats?.CurrentYearSoldTotal ?? 0;
  const memberSince = stats?.MemberSince ? moment.utc(stats.MemberSince).local().format('YYYY') : '—';

  const isNewPlayer = gamesThisYear === 0 && gamesLastYear === 0 && bought === 0 && sold === 0;

  const tiles: StatTile[] = [
    { label: `${currentYear} Games`, value: String(gamesThisYear), hint: 'This year' },
    { label: `${lastYear} Games`, value: String(gamesLastYear), hint: 'Last year' },
    { label: 'Bought', value: String(bought), hint: `${currentYear} spots bought` },
    { label: 'Sold', value: String(sold), hint: `${currentYear} spots sold` },
    { label: 'Member Since', value: memberSince, hint: 'First season' },
  ];

  return (
    <Stack gap='sm'>
      {isNewPlayer && (
        <Text c='dimmed' size='sm'>
          Your first season starts here — once you skate, your numbers show up below.
        </Text>
      )}
      <SimpleGrid cols={{ base: 2, sm: 3, md: 5 }} spacing='md'>
        {tiles.map((tile) => (
          <StatCard key={tile.label} {...tile} />
        ))}
      </SimpleGrid>
      <Group justify='flex-end'>
        <Anchor component={Link} to={`/profile/${userId}`} size='sm' fw={600}>
          View full profile →
        </Anchor>
      </Group>
    </Stack>
  );
};
