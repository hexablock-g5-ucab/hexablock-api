import type { RankedEntry } from './ranked-entry';
import type { ScoreEntry } from './score-entry';

/**
 * Orders a leaderboard (Strategy, extension point per gameId). A variant that
 * wins by fewer moves or less time registers its own strategy for its gameId;
 * `GetLeaderboardUseCase` does not change.
 */
export interface IRankingStrategy {
  /** Ranks entries already filtered to one gameId and one levelId (or game-wide). */
  rank(entries: readonly ScoreEntry[]): RankedEntry[];
}
