import type { GameId } from '../../domain/games/supported-games';
import type { GameProgress } from '../../domain/progress/game-progress';

/** Injection token for {@link ProgressRepository}. */
export const PROGRESS_REPOSITORY = Symbol('ProgressRepository');

/**
 * Port for player progress (UC-101). Every operation is scoped to one player
 * and one gameId: an adapter never returns or changes data of another player
 * or another game (statement 3.6).
 *
 * Concurrency: SyncProgressUseCase calls `find`, merges in memory, then calls
 * `save`. Two syncs of the same player and game can interleave. The adapter
 * must make that safe, so a concurrent update never lowers a stored best
 * score or uncompletes a level. For example, it can run the read and the
 * write in one transaction with a row lock, or apply max/earliest in the
 * upsert itself. The adapter PR tests this.
 */
export interface ProgressRepository {
  /** Stored progress of `userId` for `gameId`, including its levels, or null if none. */
  find(userId: string, gameId: GameId): Promise<GameProgress | null>;

  /** Stores `progress` and its levels under `(progress.userId, progress.gameId)`. */
  save(progress: GameProgress): Promise<void>;
}
