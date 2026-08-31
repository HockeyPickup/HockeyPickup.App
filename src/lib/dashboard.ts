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
export type SessionCtaState =
  'Rostered' | 'InQueue' | 'SellPending' | 'Sold' | 'BuyAvailable' | 'BuyWindowNotOpen' | 'Full';

export interface CtaPresentation {
  label: string;
  color: string;
  variant: string;
}

export const CTA_PRESENTATION: Record<SessionCtaState, CtaPresentation> = {
  Rostered: { label: "You're In", color: 'green', variant: 'light' },
  InQueue: { label: "You're in the Queue", color: 'blue', variant: 'light' },
  SellPending: { label: 'Your Spot Is Listed', color: 'orange', variant: 'light' },
  Sold: { label: 'You Sold This One', color: 'gray', variant: 'light' },
  BuyAvailable: { label: 'Buy a Spot', color: 'purple', variant: 'filled' },
  BuyWindowNotOpen: { label: 'Buy Window Not Open', color: 'gray', variant: 'default' },
  Full: { label: 'Session Full — Join Queue', color: 'blue', variant: 'outline' },
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

/**
 * The viewer's own sell for this session, if they listed their spot.
 *
 * Listing a spot takes a player out of the skate whether or not it sells — the Api marks them
 * IsPlaying=false / NotPlaying on the roster the moment they list — so this has to be checked
 * separately from roster membership, which by then no longer includes them.
 *
 * A still-listed sell wins over a completed one: a player who sold, bought back in and listed
 * again cares about the live listing, not the old sale.
 */
export const getUserSell = (
  session: DashboardSession,
  userId: string | undefined,
): DashboardBuySell | undefined => {
  if (userId === undefined) return undefined;

  const sells = session.BuySells?.filter((buySell) => buySell.SellerUserId === userId) ?? [];
  return sells.find((buySell) => !buySell.BuyerUserId) ?? sells[0];
};

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

  // Ahead of the window checks: an admin can buy before their window opens, and a player who has
  // listed or sold their spot is out of the skate regardless of what the window is doing.
  // A live buy request outranks a past sale — someone who sold and then queued to get back in is
  // trying to play, and that is the more useful thing to tell them.
  if (getUserQueuedBuy(session, user.Id)) return 'InQueue';

  const userSell = getUserSell(session, user.Id);
  if (userSell) return userSell.BuyerUserId ? 'Sold' : 'SellPending';

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
