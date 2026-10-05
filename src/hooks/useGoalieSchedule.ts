import { SessionBasicResponse } from '@/HockeyPickup.Api';
import { isCancelled } from '@/lib/dashboard';
import { describeGoalieSession, GoalieSession } from '@/lib/goalies';
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
}

/**
 * The viewer's upcoming goalie schedule, matched on UserId against each session's `Goalies`.
 *
 * Runs off the basic upcoming list — `Goalies` rides on it — so none of the detailed roster
 * payload is needed to work any of this out. The list arrives soonest first, so order is kept.
 */
export const useGoalieSchedule = (
  upcomingSessions: SessionBasicResponse[],
  userId: string | undefined,
): GoalieSchedule =>
  useMemo<GoalieSchedule>(() => {
    const starts: GoalieSession[] = [];
    const unfilledNets: GoalieSession[] = [];

    for (const session of upcomingSessions) {
      if (!session.SessionDate || isCancelled(session)) continue;

      const described = describeGoalieSession(session, userId);
      if (described.isViewerInNet) starts.push(described);
      if (described.openNets > 0) unfilledNets.push(described);
    }

    return { starts, unfilledNets, hasStarts: starts.length > 0 };
  }, [upcomingSessions, userId]);
