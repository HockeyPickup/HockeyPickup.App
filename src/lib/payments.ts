import { BuySellResponse, UserDetailedResponse } from '@/HockeyPickup.Api';

/**
 * The single definition of "this player owes someone, or someone owes them".
 *
 * Both collections already ride along on the authenticated user, so nothing here fetches.
 * The `SellerUserId` / `BuyerUserId` guards matter: a BuySell with only one side filled is a
 * standing buy or sell request, not a completed transaction, and nobody owes anything yet.
 */
export interface PendingPayments {
  /** Spots this player bought and has not marked as paid. */
  unpaidBuys: BuySellResponse[];
  /** Spots this player sold and has not marked as received. */
  unconfirmedSells: BuySellResponse[];
  hasPending: boolean;
}

export const getPendingPayments = (user: UserDetailedResponse | null): PendingPayments => {
  const unpaidBuys = user?.BuyerTransactions?.filter((bt) => !bt.PaymentSent && bt.SellerUserId) ?? [];
  const unconfirmedSells =
    user?.SellerTransactions?.filter((bt) => !bt.PaymentReceived && bt.BuyerUserId) ?? [];

  return {
    unpaidBuys,
    unconfirmedSells,
    hasPending: unpaidBuys.length > 0 || unconfirmedSells.length > 0,
  };
};

/** Newest session first — the ordering both the Account tables and the dashboard want. */
export const bySessionDateDesc = (a: BuySellResponse, b: BuySellResponse): number =>
  new Date(b.SessionDate).getTime() - new Date(a.SessionDate).getTime();
