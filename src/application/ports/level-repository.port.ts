import type { GameId } from '../../domain/games/supported-games';
import type { LevelDefinition } from '../../domain/levels/level-definition';

/** Injection token for {@link LevelRepository}. */
export const LEVEL_REPOSITORY = Symbol('LevelRepository');

/**
 * Port for published level definitions (UC-103). Every query filters by
 * gameId: an adapter never returns a level of another game (statement 3.6).
 *
 * Concurrency: UpsertLevelUseCase calls `find`, computes the next version in
 * memory, then calls `save`. Two publishes of the same level can interleave
 * and both write the same version. Publishing is admin-only, so the risk is
 * low; the adapter PR decides whether to guard it (for example with a version
 * check in the update).
 */
export interface LevelRepository {
  /** Every level of `gameId`, in no guaranteed order. */
  listByGame(gameId: GameId): Promise<LevelDefinition[]>;

  /** The level stored under `(gameId, levelId)`, or null if none. */
  find(gameId: GameId, levelId: string): Promise<LevelDefinition | null>;

  /**
   * Creates or replaces the level under `(level.gameId, level.levelId)`,
   * storing its board and spec together in one operation.
   */
  save(level: LevelDefinition): Promise<void>;
}
