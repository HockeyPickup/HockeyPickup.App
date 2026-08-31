import { DashboardHero } from '@/components/dashboard/DashboardHero';
import { useDashboardSessions } from '@/hooks/useDashboardSessions';
import { useGoalieSchedule } from '@/hooks/useGoalieSchedule';
import { useUpcomingSessions } from '@/hooks/useUpcomingSessions';
import { useUserStats } from '@/hooks/useUserStats';
import { PositionPreference, Session, UserDetailedResponse } from '@/HockeyPickup.Api';
import { getUserRosterEntry, isCancelled } from '@/lib/dashboard';
import { useAuth } from '@/lib/auth';
import { bySessionDateDesc, getPendingPayments } from '@/lib/payments';
import { DashboardBuySell, DashboardSession } from '@/types/graphql';
import { Container, Stack, Text } from '@mantine/core';
import { JSX, useMemo } from 'react';
import { ActionRequired } from './ActionRequired';
import { AlsoOnSchedule, RosteredSession } from './AlsoOnSchedule';
import { AvailableToBuy } from './AvailableToBuy';
import { DashboardSection, ZoneError } from './DashboardSection';
import { DashboardSkeleton, StatsSkeleton } from './DashboardSkeleton';
import { NetsToFill } from './NetsToFill';
import { NextSessionSpotlight } from './NextSessionSpotlight';
import { NextStartSpotlight } from './NextStartSpotlight';
import { NoSessionsCard } from './NoSessionsCard';
import { NoStartsCard } from './NoStartsCard';
import { SeasonSnapshot } from './SeasonSnapshot';
import { UpcomingStarts } from './UpcomingStarts';

interface PlayerDashboardProps {
  user: UserDetailedResponse;
}

const SCHEDULE_PREVIEW_COUNT = 4;
const BUY_PREVIEW_COUNT = 6;
const NETS_PREVIEW_COUNT = 6;

/**
 * Roster detail costs roughly 200ms per session server-side, because each alias runs the Api's
 * full GetSessionAsync. Fetching every upcoming session pushed the dashboard past four seconds,
 * so only the near horizon is fetched — comfortably more than the previews below render, and the
 * rest is one click away on /sessions.
 */
const DETAIL_SESSION_LIMIT = 8;

/**
 * How many of each kind of outstanding payment the zone renders before deferring to /account.
 * Kept small deliberately: these are alert cards at the top of the page, and a player years
 * behind would otherwise push the whole dashboard below the fold.
 */
const ACTION_REQUIRED_PREVIEW_COUNT = 3;

/**
 * Hard ceiling on aliased sessions in one document.
 *
 * Each alias expands to roughly 35 fields and HotChocolate refuses a document over 2048 of them
 * (HC0011), so anything past ~58 sessions fails the whole request rather than degrading. A player
 * with years of unsettled payments reached that easily — one had 105 — which surfaced as
 * "We couldn't load your sessions". The zones below never render more than this many anyway.
 */
const MAX_DETAIL_SESSIONS = 20;

/**
 * The authenticated home page: a personal dashboard rather than a shared landing page.
 *
 * Zones are ordered by urgency — what needs doing, then what's next, then everything else — and
 * each owns its own loading and error state so one failed query cannot blank the page.
 *
 * Skater and goalie zones compose rather than switch: goalies are named in the session note and
 * skaters are on the roster, so a player who does both sees both.
 */
export const PlayerDashboard = ({ user }: PlayerDashboardProps): JSX.Element => {
  const {
    sessions: upcomingSessions,
    allSessions,
    loading: listLoading,
    error: listError,
  } = useUpcomingSessions();
  const { isAdmin } = useAuth();
  const pending = useMemo(() => getPendingPayments(user), [user]);
  const { stats, loading: statsLoading, error: statsError } = useUserStats(user.Id);

  const liveUpcoming = useMemo<Session[]>(
    () => upcomingSessions.filter((session) => !isCancelled(session)),
    [upcomingSessions],
  );

  // Goalies are named in the session note, never on the roster, so their whole schedule comes
  // from the basic list at no extra request cost.
  const goalie = useGoalieSchedule(allSessions, user);
  const isGoalie = user.PositionPreference === PositionPreference.Goalie;
  const showGoalieZones = isGoalie || goalie.hasStarts;

  // Newest first, and only as many as the zone shows: the counterparty lookup below fetches a
  // session per rendered item, so rendering all of them would size the query by how far behind a
  // player is on payments rather than by what the page needs.
  const visiblePayments = useMemo(
    () => ({
      unpaidBuys: [...pending.unpaidBuys]
        .sort(bySessionDateDesc)
        .slice(0, ACTION_REQUIRED_PREVIEW_COUNT),
      unconfirmedSells: [...pending.unconfirmedSells]
        .sort(bySessionDateDesc)
        .slice(0, ACTION_REQUIRED_PREVIEW_COUNT),
    }),
    [pending],
  );

  const pendingTotal = pending.unpaidBuys.length + pending.unconfirmedSells.length;
  const pendingHidden =
    pendingTotal - visiblePayments.unpaidBuys.length - visiblePayments.unconfirmedSells.length;

  // One request covers both jobs: rosters for the near-horizon sessions, and counterparty names
  // for the payments actually on screen — including past sessions, which never appear above.
  const sessionIds = useMemo<number[]>(() => {
    const ids = new Set<number>();
    liveUpcoming.slice(0, DETAIL_SESSION_LIMIT).forEach((session) => {
      if (session.SessionId !== undefined) ids.add(session.SessionId);
    });
    visiblePayments.unpaidBuys.forEach((transaction) => ids.add(transaction.SessionId));
    visiblePayments.unconfirmedSells.forEach((transaction) => ids.add(transaction.SessionId));
    return [...ids].slice(0, MAX_DETAIL_SESSIONS);
  }, [liveUpcoming, visiblePayments]);

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

  // A cancelled game must never become "Your Next Session" with a live countdown running on it.
  const upcomingIds = useMemo(
    () => new Set(liveUpcoming.map((session) => session.SessionId)),
    [liveUpcoming],
  );

  const liveSessions = useMemo<DashboardSession[]>(
    () => detailedSessions.filter((session) => upcomingIds.has(session.SessionId)),
    [detailedSessions, upcomingIds],
  );

  const rostered = useMemo<RosteredSession[]>(
    () =>
      liveSessions
        .map((session) => ({ session, rosterEntry: getUserRosterEntry(session, user.Id) }))
        .filter((item): item is RosteredSession => item.rosterEntry !== undefined),
    [liveSessions, user.Id],
  );

  // A goalie does not buy skater spots, so the buy grid would be noise on their dashboard.
  const buyable = useMemo<DashboardSession[]>(
    () => (isGoalie ? [] : liveSessions.filter((session) => !getUserRosterEntry(session, user.Id))),
    [liveSessions, user.Id, isGoalie],
  );

  const [nextRostered, ...laterRostered] = rostered;
  const [nextStart, ...laterStarts] = goalie.starts;

  const schedulePreview = laterRostered.slice(0, SCHEDULE_PREVIEW_COUNT);
  const startsPreview = laterStarts.slice(0, SCHEDULE_PREVIEW_COUNT);
  const buyPreview = buyable.slice(0, BUY_PREVIEW_COUNT);
  const netsPreview = isAdmin() ? goalie.unfilledNets.slice(0, NETS_PREVIEW_COUNT) : [];

  const sessionsLoading = listLoading || detailLoading;
  const nothingForViewer = !nextStart && !nextRostered && buyPreview.length === 0;
  const nothingToShow = nothingForViewer && netsPreview.length === 0;

  return (
    <Container size='xl' mb='xl'>
      <Stack gap='xl'>
        <DashboardHero user={user} />

        <ActionRequired
          unpaidBuys={visiblePayments.unpaidBuys}
          unconfirmedSells={visiblePayments.unconfirmedSells}
          totalCount={pendingTotal}
          hiddenCount={pendingHidden}
          buySellsById={buySellsById}
        />

        {(listError ?? detailError) ? (
          <ZoneError
            message="We couldn't load your sessions right now."
            onRetry={sessionIds.length > 0 ? refetch : undefined}
          />
        ) : sessionsLoading ? (
          <DashboardSkeleton />
        ) : liveUpcoming.length === 0 ? (
          <NoSessionsCard />
        ) : nothingToShow ? (
          showGoalieZones ? (
            <NoStartsCard />
          ) : (
            <NoSessionsCard />
          )
        ) : (
          <>
            {nextStart && (
              <DashboardSection
                title='Your Next Start'
                actionLabel='All Sessions'
                actionTo='/sessions'
              >
                <NextStartSpotlight start={nextStart} image='/static/game1.jpg' />
              </DashboardSection>
            )}

            {startsPreview.length > 0 && (
              <DashboardSection
                title='Your Upcoming Starts'
                actionLabel={laterStarts.length > startsPreview.length ? 'View All' : undefined}
                actionTo={laterStarts.length > startsPreview.length ? '/sessions' : undefined}
              >
                <UpcomingStarts items={startsPreview} />
              </DashboardSection>
            )}

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
                actionLabel={laterRostered.length > schedulePreview.length ? 'View All' : undefined}
                actionTo={laterRostered.length > schedulePreview.length ? '/sessions' : undefined}
              >
                <AlsoOnSchedule items={schedulePreview} />
              </DashboardSection>
            )}
            {netsPreview.length > 0 && (
              <DashboardSection
                title='Nets to Fill'
                actionLabel={
                  goalie.unfilledNets.length > netsPreview.length ? 'View All' : undefined
                }
                actionTo={goalie.unfilledNets.length > netsPreview.length ? '/sessions' : undefined}
              >
                <Stack gap='sm'>
                  <Text c='dimmed'>
                    These skates are still short a goalie. Invites go out from you, so nobody sees
                    this list but admins.
                  </Text>
                  <NetsToFill items={netsPreview} />
                </Stack>
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
            <SeasonSnapshot
              stats={stats}
              userId={user.Id}
              isGoalie={isGoalie}
              startsBooked={goalie.starts.length}
              startsByYear={goalie.startsByYear}
            />
          )}
        </DashboardSection>
      </Stack>
    </Container>
  );
};
