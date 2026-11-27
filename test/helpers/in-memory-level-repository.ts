import type { LevelRepository } from '../../src/application/ports/level-repository.port';
import type { GameId } from '../../src/domain/games/supported-games';
import type { LevelDefinition } from '../../src/domain/levels/level-definition';

/** Test double of the level port, keyed by (gameId, levelId). Records every call. */
export class InMemoryLevelRepository implements LevelRepository {
  readonly listCalls: GameId[] = [];
  readonly findCalls: { gameId: GameId; levelId: string }[] = [];
  readonly saveCalls: LevelDefinition[] = [];
  private readonly rows = new Map<string, LevelDefinition>();

  listByGame(gameId: GameId): Promise<LevelDefinition[]> {
    this.listCalls.push(gameId);
    return Promise.resolve(
      [...this.rows.values()].filter((level) => level.gameId === gameId),
    );
  }

  find(gameId: GameId, levelId: string): Promise<LevelDefinition | null> {
    this.findCalls.push({ gameId, levelId });
    return Promise.resolve(this.rows.get(key(gameId, levelId)) ?? null);
  }

  save(level: LevelDefinition): Promise<void> {
    this.saveCalls.push(level);
    this.rows.set(key(level.gameId, level.levelId), level);
    return Promise.resolve();
  }

  /** Arrange helper: stores levels without recording a call. */
  seed(...levels: LevelDefinition[]): this {
    for (const level of levels) {
      this.rows.set(key(level.gameId, level.levelId), level);
    }
    return this;
  }

  /** Assert helper: reads a row without recording a call. */
  stored(gameId: GameId, levelId: string): LevelDefinition | null {
    return this.rows.get(key(gameId, levelId)) ?? null;
  }
}

function key(gameId: GameId, levelId: string): string {
  return JSON.stringify([gameId, levelId]);
}
