/**
 * Seat accounting for the Group / Institution tiers (WS5).
 *
 * A seat is consumed by an active member (the admin counts as one) OR a pending
 * invite. There is no cross-seat pooling — every seat is one person.
 */

export interface SeatTally {
  /** Purchased seat allowance. */
  total: number;
  /** Members (incl. admin) + pending invites. */
  used: number;
  /** Seats still open for new invites (never negative). */
  available: number;
}

export function tallySeats(
  seatCount: number,
  memberCount: number,
  pendingCount: number
): SeatTally {
  const total = Math.max(0, Math.floor(seatCount || 0));
  const used = Math.max(0, memberCount) + Math.max(0, pendingCount);
  return { total, used, available: Math.max(0, total - used) };
}

export function hasFreeSeat(
  seatCount: number,
  memberCount: number,
  pendingCount: number
): boolean {
  return tallySeats(seatCount, memberCount, pendingCount).available > 0;
}
