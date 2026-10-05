import { SessionBasicResponse } from '@/HockeyPickup.Api';
import { isCancelled } from '@/lib/dashboard';
import { describeGoalieSession, GoalieSession } from '@/lib/goalies';
import { nowPacific, sessionMoment } from '@/lib/pacificTime';
import { useMemo } from 'react';

export interface GoalieSchedule {
  /** Upcoming sessions with this user in net, soonest first. */
  starts: GoalieSession[];
  /**
   * Upcoming sessions still short of a goalie, regardless of who is viewing.
   *
   * Filling these is the commissioner's job — goalies are invited and accept or decline, they do
   * not claim a net — so this is for the admin view, not the goalie's.
   */
  unfilledNets: GoalieSession[];
  /** True when this user is in net for at least one upcoming session. */
  hasStarts: boolean;
  /** Starts already played, by calendar year — see the note below on why these are counted here. */
  startsByYear: Record<number, number>;
}

/**
 * The viewer's goalie schedule, matched on UserId against each session's `Goalies`.
 *
 * Runs off the basic session list — `Goalies` rides on it — so none of the detailed roster
 * payload is needed to work any of this out.
 *
 * Past starts are counted here rather than read from UserStats, which counts every playing roster
 * row as a game and so cannot tell a start from a skate.
 */
export const useGoalieSchedule = (
  allSessions: SessionBasicResponse[],
  userId: string | undefined,
): GoalieSchedule =>
  useMemo<GoalieSchedule>(() => {
    const now = nowPacific();

    const starts: GoalieSession[] = [];
    const unfilledNets: GoalieSession[] = [];
    const startsByYear: Record<number, number> = {};

    for (const session of allSessions) {
      if (!session.SessionDate || isCancelled(session)) continue;

      const when = sessionMoment(session.SessionDate);
      const described = describeGoalieSession(session, userId);

      if (when.isAfter(now)) {
        if (described.isViewerInNet) starts.push(described);
        if (described.openNets > 0) unfilledNets.push(described);
      } else if (described.isViewerInNet) {
        const year = when.year();
        startsByYear[year] = (startsByYear[year] ?? 0) + 1;
      }
    }

    const bySoonest = (a: GoalieSession, b: GoalieSession): number =>
      sessionMoment(a.session.SessionDate).valueOf() -
      sessionMoment(b.session.SessionDate).valueOf();

    starts.sort(bySoonest);
    unfilledNets.sort(bySoonest);

    return { starts, unfilledNets, hasStarts: starts.length > 0, startsByYear };
  }, [allSessions, userId]);
