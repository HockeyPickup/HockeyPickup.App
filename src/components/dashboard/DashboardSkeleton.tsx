import { Card, Group, SimpleGrid, Skeleton, Stack } from '@mantine/core';
import { JSX } from 'react';

/**
 * Placeholders shaped like the zones they stand in for, so the dashboard does not jump when the
 * data lands. Heights mirror the real components; keep them in step when those change.
 */

const ZoneCard = ({ children }: { children: React.ReactNode }): JSX.Element => (
  <Card shadow='sm' p='lg' radius='md' withBorder bg='dark.6'>
    {children}
  </Card>
);

export const SpotlightSkeleton = (): JSX.Element => (
  <ZoneCard>
    <Stack gap='md'>
      <Skeleton height={14} width={140} radius='sm' />
      <Group justify='space-between' wrap='nowrap'>
        <Stack gap='sm' style={{ flex: 1 }}>
          <Skeleton height={26} width='60%' radius='sm' />
          <Skeleton height={18} width='40%' radius='sm' />
          <Skeleton height={44} width={220} radius='md' />
          <Skeleton height={18} width='70%' radius='sm' />
        </Stack>
        <Skeleton height={160} width={280} radius='md' visibleFrom='md' />
      </Group>
      <Skeleton height={42} width={180} radius='md' />
    </Stack>
  </ZoneCard>
);

export const ScheduleSkeleton = (): JSX.Element => (
  <ZoneCard>
    <Stack gap='sm'>
      <Skeleton height={14} width={180} radius='sm' />
      <Skeleton height={52} radius='sm' />
      <Skeleton height={52} radius='sm' />
    </Stack>
  </ZoneCard>
);

export const BuyGridSkeleton = (): JSX.Element => (
  <Stack gap='sm'>
    <Skeleton height={14} width={160} radius='sm' />
    <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing='md'>
      <Skeleton height={168} radius='md' />
      <Skeleton height={168} radius='md' />
      <Skeleton height={168} radius='md' />
    </SimpleGrid>
  </Stack>
);

export const StatsSkeleton = (): JSX.Element => (
  <Stack gap='sm'>
    <Skeleton height={14} width={150} radius='sm' />
    <SimpleGrid cols={{ base: 2, sm: 3, md: 5 }} spacing='md'>
      {Array.from({ length: 5 }, (_, index) => (
        <Skeleton key={index} height={92} radius='md' />
      ))}
    </SimpleGrid>
  </Stack>
);

/** The full stack, used while the upcoming-session list is still resolving. */
export const DashboardSkeleton = (): JSX.Element => (
  <Stack gap='xl'>
    <SpotlightSkeleton />
    <ScheduleSkeleton />
    <BuyGridSkeleton />
  </Stack>
);
