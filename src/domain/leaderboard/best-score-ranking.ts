import type { RankedEntry } from './ranked-entry';
import type { IRankingStrategy } from './ranking-strategy';
import type { ScoreEntry } from './score-entry';

/** Negative when `a` ranks ahead of `b`: higher score, fewer moves, less time, earlier. */
function compareBest(a: ScoreEntry, b: ScoreEntry): number {
  return (
    b.score - a.score ||
    a.moves - b.moves ||
    a.elapsedMs - b.elapsedMs ||
    a.createdAt.getTime() - b.createdAt.getTime()
  );
}

/**
 * Default ranking (UC-102, BR-102-4 and BR-102-5): one row per player with
 * their best entry, ordered by `compareBest`. Full ties keep input order.
 */
export class BestScoreRanking implements IRankingStrategy {
  rank(entries: readonly ScoreEntry[]): RankedEntry[] {
    const bestByUser = new Map<string, ScoreEntry>();
    for (const entry of entries) {
      const best = bestByUser.get(entry.userId);
      if (best === undefined || compareBest(entry, best) < 0) {
        bestByUser.set(entry.userId, entry);
      }
    }

    return [...bestByUser.values()].sort(compareBest).map((entry, index) =>
      Object.freeze({
        rank: index + 1,
        userId: entry.userId,
        score: entry.score,
        moves: entry.moves,
        elapsedMs: entry.elapsedMs,
        createdAt: entry.createdAt,
      }),
    );
  }
}
