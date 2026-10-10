import type { SessionBasicResponse, SessionGoalie } from '@/HockeyPickup.Api';

/**
 * Goalies are session roster rows with Position = Goalie, delivered on every session as
 * `Goalies` (playing goalies only, in the order they joined). Everything here matches people by
 * UserId — never by name — and never reads the free-text `Note`.
 *
 * Two goalies are expected per session. They swap ends at the halfway mark, so a goalie is never
 * "on" Light or Dark and is never the partner of the other — they simply both play.
 */

/** Two nets, two goalies. A session with fewer than this still needs someone. */
export const GOALIES_PER_SESSION = 2;

type GoalieSource = Pick<SessionBasicResponse, 'Goalies'>;

/** The session's playing goalies, in the order they joined. */
export const getSessionGoalies = (session: GoalieSource): SessionGoalie[] =>
  (session.Goalies ?? []).filter((goalie) => goalie.IsPlaying);

export const isUserInNet = (session: GoalieSource, userId: string | undefined): boolean =>
  userId !== undefined && getSessionGoalies(session).some((goalie) => goalie.UserId === userId);

/** Nets still unassigned, never negative. */
export const openNets = (session: GoalieSource): number =>
  Math.max(0, GOALIES_PER_SESSION - getSessionGoalies(session).length);

export const goalieName = (goalie: Pick<SessionGoalie, 'FirstName' | 'LastName'>): string =>
  `${goalie.FirstName} ${goalie.LastName}`;

export interface GoalieSession {
  session: SessionBasicResponse;
  /** Every playing goalie on the session, in the order they joined. */
  goalies: SessionGoalie[];
  /** The goalies other than the viewer. */
  otherGoalies: SessionGoalie[];
  /** True when the viewer is one of the session's goalies. */
  isViewerInNet: boolean;
  /** Nets still unassigned, never negative. */
  openNets: number;
}

export const describeGoalieSession = (
  session: SessionBasicResponse,
  userId: string | undefined,
): GoalieSession => {
  const goalies = getSessionGoalies(session);

  return {
    session,
    goalies,
    otherGoalies: goalies.filter((goalie) => goalie.UserId !== userId),
    isViewerInNet: isUserInNet(session, userId),
    openNets: openNets(session),
  };
};
