import { DashboardHero } from '@/components/dashboard/DashboardHero';
import { useDashboardSessions } from '@/hooks/useDashboardSessions';
import { useUpcomingSessions } from '@/hooks/useUpcomingSessions';
import { useUserStats } from '@/hooks/useUserStats';
import { UserDetailedResponse } from '@/HockeyPickup.Api';
import { getUserRosterEntry, isCancelled } from '@/lib/dashboard';
import { getPendingPayments } from '@/lib/payments';
import { DashboardBuySell, DashboardSession } from '@/types/graphql';
import { Container, Stack, Text } from '@mantine/core';
import { JSX, useMemo } from 'react';
import { ActionRequired } from './ActionRequired';
import { AlsoOnSchedule, RosteredSession } from './AlsoOnSchedule';
import { AvailableToBuy } from './AvailableToBuy';
import { DashboardSection, ZoneError } from './DashboardSection';
import { DashboardSkeleton, StatsSkeleton } from './DashboardSkeleton';
import { NextSessionSpotlight } from './NextSessionSpotlight';
import { NoSessionsCard } from './NoSessionsCard';
import { SeasonSnapshot } from './SeasonSnapshot';

interface PlayerDashboardProps {
  user: UserDetailedResponse;
}

const SCHEDULE_PREVIEW_COUNT = 4;
const BUY_PREVIEW_COUNT = 6;

/**
 * The authenticated home page: a personal dashboard rather than a shared landing page.
 *
 * Zones are ordered by urgency — what needs doing, then what's next, then everything else — and
 * each owns its own loading and error state so one failed query cannot blank the page.
 */
export const PlayerDashboard = ({ user }: PlayerDashboardProps): JSX.Element => {
  const {
    sessions: upcomingSessions,
    loading: listLoading,
    error: listError,
  } = useUpcomingSessions();
  const pending = useMemo(() => getPendingPayments(user), [user]);
  const { stats, loading: statsLoading, error: statsError } = useUserStats(user.Id);

  // One request covers both jobs: rosters for the upcoming sessions, and counterparty names for
  // any session with an outstanding payment — including past ones, which never appear above.
  const sessionIds = useMemo<number[]>(() => {
    const ids = new Set<number>();
    upcomingSessions.forEach((session) => {
      if (session.SessionId !== undefined) ids.add(session.SessionId);
    });
    pending.unpaidBuys.forEach((transaction) => ids.add(transaction.SessionId));
    pending.unconfirmedSells.forEach((transaction) => ids.add(transaction.SessionId));
    return [...ids];
  }, [upcomingSessions, pending]);

  const {
    sessions: detailedSessions,
    loading: detailLoading,
    error: detailError,
    refetch,
  } = useDashboardSessions(sessionIds);

  const buySellsById = useMemo<Map<number, DashboardBuySell>>(
    () =>
      new Map(
        detailedSessions
          .flatMap((session) => session.BuySells ?? [])
          .map((buySell) => [buySell.BuySellId, buySell]),
      ),
    [detailedSessions],
  );

  // Only sessions that are still ahead and not called off; a cancelled game must never become
  // "Your Next Session" with a live countdown running against it.
  const upcomingIds = useMemo(
    () => new Set(upcomingSessions.map((session) => session.SessionId)),
    [upcomingSessions],
  );

  const liveSessions = useMemo<DashboardSession[]>(
    () =>
      detailedSessions.filter(
        (session) => upcomingIds.has(session.SessionId) && !isCancelled(session),
      ),
    [detailedSessions, upcomingIds],
  );

  const rostered = useMemo<RosteredSession[]>(
    () =>
      liveSessions
        .map((session) => ({ session, rosterEntry: getUserRosterEntry(session, user.Id) }))
        .filter((item): item is RosteredSession => item.rosterEntry !== undefined),
    [liveSessions, user.Id],
  );

  const buyable = useMemo<DashboardSession[]>(
    () => liveSessions.filter((session) => !getUserRosterEntry(session, user.Id)),
    [liveSessions, user.Id],
  );

  const [nextRostered, ...laterRostered] = rostered;

  // A regular is rostered on every session for months out; the whole list would bury the zones
  // below it. Show the near horizon and hand the rest to /sessions.
  const schedulePreview = laterRostered.slice(0, SCHEDULE_PREVIEW_COUNT);
  const buyPreview = buyable.slice(0, BUY_PREVIEW_COUNT);

  const sessionsLoading = listLoading || detailLoading;

  return (
    <Container size='xl' px='md' mb='xl'>
      <Stack gap='xl'>
        <DashboardHero user={user} />

        <ActionRequired
          unpaidBuys={pending.unpaidBuys}
          unconfirmedSells={pending.unconfirmedSells}
          buySellsById={buySellsById}
        />

        {listError ?? detailError ? (
          <ZoneError
            message="We couldn't load your sessions right now."
            onRetry={sessionIds.length > 0 ? refetch : undefined}
          />
        ) : sessionsLoading ? (
          <DashboardSkeleton />
        ) : liveSessions.length === 0 ? (
          <NoSessionsCard />
        ) : (
          <>
            {nextRostered && (
              <DashboardSection
                title='Your Next Session'
                actionLabel='All Sessions'
                actionTo='/sessions'
              >
                <NextSessionSpotlight
                  session={nextRostered.session}
                  rosterEntry={nextRostered.rosterEntry}
                  image='/static/game1.jpg'
                />
              </DashboardSection>
            )}

            {schedulePreview.length > 0 && (
              <DashboardSection
                title='Also On Your Schedule'
                actionLabel={
                  laterRostered.length > schedulePreview.length
                    ? `View All ${rostered.length}`
                    : undefined
                }
                actionTo={
                  laterRostered.length > schedulePreview.length ? '/sessions' : undefined
                }
              >
                <AlsoOnSchedule items={schedulePreview} />
              </DashboardSection>
            )}

            {buyPreview.length > 0 && (
              <DashboardSection
                title='Available to Buy'
                actionLabel={buyable.length > buyPreview.length ? 'View All' : undefined}
                actionTo={buyable.length > buyPreview.length ? '/sessions' : undefined}
              >
                <Stack gap='sm'>
                  {rostered.length === 0 && (
                    <Text c='dimmed'>You&apos;re not on a roster yet — grab a spot below.</Text>
                  )}
                  <AvailableToBuy sessions={buyPreview} user={user} />
                </Stack>
              </DashboardSection>
            )}
          </>
        )}

        <DashboardSection title='Season Snapshot'>
          {statsError ? (
            <ZoneError message="We couldn't load your season stats." />
          ) : statsLoading ? (
            <StatsSkeleton />
          ) : (
            <SeasonSnapshot stats={stats} userId={user.Id} />
          )}
        </DashboardSection>
      </Stack>
    </Container>
  );
};
