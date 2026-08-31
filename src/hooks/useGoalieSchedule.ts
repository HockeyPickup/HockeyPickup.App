import { Session, UserDetailedResponse } from '@/HockeyPickup.Api';
import { isCancelled } from '@/lib/dashboard';
import { describeGoalieSession, GoalieSession } from '@/lib/goalies';
import { nowPacific, sessionMoment } from '@/lib/pacificTime';
import { useMemo } from 'react';

export interface GoalieSchedule {
  /** Upcoming sessions whose note names this user, soonest first. */
  starts: GoalieSession[];
  /** Upcoming sessions short of a goalie that this user is not already booked for. */
  openNets: GoalieSession[];
  /** True when this user is named in at least one upcoming note. */
  hasStarts: boolean;
  /** Starts already played, by calendar year — see the note below on why these are counted here. */
  startsByYear: Record<number, number>;
}

/**
 * Reads goalie assignments out of the session notes.
 *
 * Runs off the basic session list — goalies live in `Note`, not `CurrentRosters`, so none of the
 * detailed roster payload is needed to work any of this out.
 *
 * Past starts are counted here rather than read from UserStats deliberately: UserStats derives
 * games played from roster membership, and since a goalie is never on a roster it reports zero
 * for even the busiest goalie in the club. Counting the notes is the only honest number available
 * until goalie assignments are normalised.
 */
export const useGoalieSchedule = (
  allSessions: Session[],
  user: Pick<UserDetailedResponse, 'FirstName' | 'LastName'>,
): GoalieSchedule => {
  const firstName = user.FirstName ?? '';
  const lastName = user.LastName ?? '';

  return useMemo<GoalieSchedule>(() => {
    const now = nowPacific();
    const viewer = { FirstName: firstName, LastName: lastName };

    const starts: GoalieSession[] = [];
    const openNets: GoalieSession[] = [];
    const startsByYear: Record<number, number> = {};

    for (const session of allSessions) {
      if (!session.SessionDate || isCancelled(session)) continue;

      const when = sessionMoment(session.SessionDate);
      const described = describeGoalieSession(session, viewer);

      if (when.isAfter(now)) {
        if (described.isViewerInNet) starts.push(described);
        else if (described.openNets > 0) openNets.push(described);
      } else if (described.isViewerInNet) {
        const year = when.year();
        startsByYear[year] = (startsByYear[year] ?? 0) + 1;
      }
    }

    const bySoonest = (a: GoalieSession, b: GoalieSession): number =>
      sessionMoment(a.session.SessionDate).valueOf() -
      sessionMoment(b.session.SessionDate).valueOf();

    starts.sort(bySoonest);
    openNets.sort(bySoonest);

    return { starts, openNets, hasStarts: starts.length > 0, startsByYear };
  }, [allSessions, firstName, lastName]);
};
