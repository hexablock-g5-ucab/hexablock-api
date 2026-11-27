/**
 * One leaderboard row. The player's `displayName` is not part of the domain:
 * the adapter or the controller adds it from `userId`.
 */
export interface RankedEntry {
  /** Starts at 1; rows never share a rank. */
  readonly rank: number;
  readonly userId: string;
  readonly score: number;
  readonly moves: number;
  readonly elapsedMs: number;
  readonly createdAt: Date;
}
