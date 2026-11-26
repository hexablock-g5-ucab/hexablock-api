import type { ProgressRepository } from '../../src/application/ports/progress-repository.port';
import type { GameId } from '../../src/domain/games/supported-games';
import type { GameProgress } from '../../src/domain/progress/game-progress';

/** Test double of the progress port, keyed by (userId, gameId). Records every call. */
export class InMemoryProgressRepository implements ProgressRepository {
  readonly findCalls: { userId: string; gameId: GameId }[] = [];
  readonly saveCalls: GameProgress[] = [];
  private readonly rows = new Map<string, GameProgress>();

  find(userId: string, gameId: GameId): Promise<GameProgress | null> {
    this.findCalls.push({ userId, gameId });
    return Promise.resolve(this.rows.get(key(userId, gameId)) ?? null);
  }

  save(progress: GameProgress): Promise<void> {
    this.saveCalls.push(progress);
    this.rows.set(key(progress.userId, progress.gameId), progress);
    return Promise.resolve();
  }

  /** Arrange helper: stores progress without recording a call. */
  seed(...progress: GameProgress[]): this {
    for (const item of progress) {
      this.rows.set(key(item.userId, item.gameId), item);
    }
    return this;
  }

  /** Assert helper: reads a row without recording a call. */
  stored(userId: string, gameId: GameId): GameProgress | null {
    return this.rows.get(key(userId, gameId)) ?? null;
  }
}

function key(userId: string, gameId: GameId): string {
  return JSON.stringify([userId, gameId]);
}
