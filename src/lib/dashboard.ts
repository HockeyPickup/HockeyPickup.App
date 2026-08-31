import { TeamAssignment, UserDetailedResponse } from '@/HockeyPickup.Api';
import { isPastPacific } from '@/lib/pacificTime';
import { DashboardBuySell, DashboardRosterPlayer, DashboardSession } from '@/types/graphql';
import { Moment } from 'moment-timezone';

/**
 * What the dashboard should offer the viewer for one session.
 *
 * Derived entirely from data already on the page — no per-session /can-buy calls. It intentionally
 * describes the *direct buy* path only; the lottery has its own flow on the session page.
 *
 * Adding the in-development draw feature means adding 'LotteryOpen' here and one entry to
 * CTA_PRESENTATION. Nothing else in the card needs to change.
 */
export type SessionCtaState = 'Rostered' | 'InQueue' | 'BuyAvailable' | 'BuyWindowNotOpen' | 'Full';

export interface CtaPresentation {
  label: string;
  color: string;
  variant: string;
  /** Rendered under the button when the state needs explaining (e.g. when the window opens). */
  showsWindowHint: boolean;
}

export const CTA_PRESENTATION: Record<SessionCtaState, CtaPresentation> = {
  Rostered: { label: "You're In", color: 'green', variant: 'light', showsWindowHint: false },
  InQueue: {
    label: "You're in the Queue",
    color: 'blue',
    variant: 'light',
    showsWindowHint: false,
  },
  BuyAvailable: { label: 'Buy a Spot', color: 'purple', variant: 'filled', showsWindowHint: false },
  BuyWindowNotOpen: {
    label: 'Buy Window Not Open',
    color: 'gray',
    variant: 'default',
    showsWindowHint: true,
  },
  Full: {
    label: 'Session Full — Join Queue',
    color: 'blue',
    variant: 'outline',
    showsWindowHint: false,
  },
};

/**
 * The Api marks a session cancelled in its free-text note; it has no dedicated flag.
 * Takes the note shape rather than a full session so the basic list can use it too.
 */
export const isCancelled = (session: { Note?: string | null }): boolean =>
  session.Note?.toLowerCase().includes('cancelled') ?? false;

export const getUserRosterEntry = (
  session: DashboardSession,
  userId: string | undefined,
): DashboardRosterPlayer | undefined =>
  userId === undefined
    ? undefined
    : session.CurrentRosters?.find((player) => player.UserId === userId && player.IsPlaying);

/** A spot is genuinely for sale only while it has a seller and no buyer has claimed it. */
export const getOpenSells = (session: DashboardSession): DashboardBuySell[] =>
  session.BuySells?.filter((buySell) => buySell.SellerUserId && !buySell.BuyerUserId) ?? [];

/**
 * The viewer's outstanding buy request, if they have one.
 *
 * A buy with no seller attached is someone waiting in line — the same shape the Api treats as
 * "You already have an active Buy for this session" when it refuses a second one.
 */
export const getUserQueuedBuy = (
  session: DashboardSession,
  userId: string | undefined,
): DashboardBuySell | undefined =>
  userId === undefined
    ? undefined
    : session.BuySells?.find((buySell) => buySell.BuyerUserId === userId && !buySell.SellerUserId);

/** Where the viewer sits in line, as the queue view words it: "Next in Line", "In Queue (6)". */
export const getUserQueueStatus = (
  session: DashboardSession,
  userId: string | undefined,
): string | null => {
  const queued = getUserQueuedBuy(session, userId);
  if (!queued) return null;

  const entry = session.BuyingQueues?.find((row) => row.BuySellId === queued.BuySellId);
  return entry?.QueueStatus?.trim() ? entry.QueueStatus.trim() : null;
};

export const getPlayingCount = (session: DashboardSession): number =>
  session.CurrentRosters?.filter((player) => player.IsPlaying).length ?? 0;

/**
 * The viewer's buy window. Mirrors BuySellService.CanBuyAsync: Preferred Plus opens first,
 * then Preferred, then everyone else.
 */
export const getBuyWindowForUser = (
  session: DashboardSession,
  user: UserDetailedResponse,
): string | undefined => {
  if (user.PreferredPlus) return session.BuyWindowPreferredPlus;
  if (user.Preferred) return session.BuyWindowPreferred;
  return session.BuyWindow;
};

export const getSessionCtaState = (
  session: DashboardSession,
  user: UserDetailedResponse,
  now: Moment,
): SessionCtaState => {
  if (getUserRosterEntry(session, user.Id)) return 'Rostered';
  // Ahead of the window check: an admin can buy before their window opens, so being in the queue
  // does not imply the window is open.
  if (getUserQueuedBuy(session, user.Id)) return 'InQueue';
  if (!isPastPacific(getBuyWindowForUser(session, user), now)) return 'BuyWindowNotOpen';
  return getOpenSells(session).length > 0 ? 'BuyAvailable' : 'Full';
};

export interface TeamIdentity {
  name: string;
  logo: string;
  /** Chip background — the light team reads light, the dark team reads dark. */
  background: string;
  textColor: string;
  borderColor: string;
}

const TEAM_IDENTITIES: Record<TeamAssignment, TeamIdentity> = {
  [TeamAssignment.Light]: {
    name: 'Rockets (Light)',
    logo: '/static/Rockets_Logo.jpg',
    background: 'var(--mantine-color-gray-1)',
    textColor: 'var(--mantine-color-dark-9)',
    borderColor: 'var(--mantine-color-gray-4)',
  },
  [TeamAssignment.Dark]: {
    name: 'Beauties (Dark)',
    logo: '/static/Beauties_Logo.jpg',
    background: 'var(--mantine-color-dark-9)',
    textColor: 'var(--mantine-color-gray-0)',
    borderColor: 'var(--mantine-color-dark-3)',
  },
  [TeamAssignment.TBD]: {
    name: 'Team TBD',
    logo: '/static/JB_Puck_Logo.png',
    background: 'var(--mantine-color-dark-6)',
    textColor: 'var(--mantine-color-gray-3)',
    borderColor: 'var(--mantine-color-dark-4)',
  },
};

export const getTeamIdentity = (team: TeamAssignment | undefined): TeamIdentity =>
  TEAM_IDENTITIES[team ?? TeamAssignment.TBD];
