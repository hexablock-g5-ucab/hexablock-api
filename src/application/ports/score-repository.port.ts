import type { GameId } from '../../domain/games/supported-games';
import type { ScoreEntry } from '../../domain/leaderboard/score-entry';

export const SCORE_REPOSITORY = Symbol('ScoreRepository');

/** Stores finished-game scores (UC-102). */
export interface ScoreRepository {
  add(entry: ScoreEntry): Promise<void>;

  /**
   * Entries of exactly one gameId and one levelId. Every implementation filters
   * by both (statement 3.6): `levelId === null` returns only game-wide entries,
   * a level id returns only that level's entries. Order is not guaranteed.
   */
  listByGame(gameId: GameId, levelId: string | null): Promise<ScoreEntry[]>;
}
