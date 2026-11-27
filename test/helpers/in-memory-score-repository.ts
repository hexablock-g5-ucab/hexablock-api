import type { ScoreRepository } from '../../src/application/ports/score-repository.port';
import type { GameId } from '../../src/domain/games/supported-games';
import type { ScoreEntry } from '../../src/domain/leaderboard/score-entry';

/** Test fake of the score repository port: filters by gameId and levelId like the real adapter must. */
export class InMemoryScoreRepository implements ScoreRepository {
  private readonly entries: ScoreEntry[] = [];

  constructor(seed: readonly ScoreEntry[] = []) {
    this.entries.push(...seed);
  }

  add(entry: ScoreEntry): Promise<void> {
    this.entries.push(entry);
    return Promise.resolve();
  }

  listByGame(gameId: GameId, levelId: string | null): Promise<ScoreEntry[]> {
    return Promise.resolve(
      this.entries.filter(
        (entry) => entry.gameId === gameId && entry.levelId === levelId,
      ),
    );
  }

  /** Every stored entry, in insertion order. */
  all(): ScoreEntry[] {
    return [...this.entries];
  }
}
