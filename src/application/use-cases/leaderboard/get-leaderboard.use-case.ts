import type { GameId } from '../../../domain/games/supported-games';
import { BestScoreRanking } from '../../../domain/leaderboard/best-score-ranking';
import type { RankedEntry } from '../../../domain/leaderboard/ranked-entry';
import type { IRankingStrategy } from '../../../domain/leaderboard/ranking-strategy';
import type { ScoreRepository } from '../../ports/score-repository.port';
import type { UseCase } from '../use-case';

export const DEFAULT_LEADERBOARD_LIMIT = 50;

export interface LeaderboardQuery {
  gameId: GameId;
  /** Omit for the game-wide leaderboard. */
  levelId?: string;
  /** Positive integer; defaults to `DEFAULT_LEADERBOARD_LIMIT`. */
  limit?: number;
}

/**
 * UC-102 read: ranks one gameId (and optionally one level) with the strategy
 * registered for that gameId, or `BestScoreRanking` when none is registered.
 */
export class GetLeaderboardUseCase implements UseCase<
  LeaderboardQuery,
  RankedEntry[]
> {
  constructor(
    private readonly scores: ScoreRepository,
    private readonly strategies: ReadonlyMap<
      GameId,
      IRankingStrategy
    > = new Map(),
    private readonly fallback: IRankingStrategy = new BestScoreRanking(),
  ) {}

  async execute(query: LeaderboardQuery): Promise<RankedEntry[]> {
    const limit = query.limit ?? DEFAULT_LEADERBOARD_LIMIT;
    if (!Number.isInteger(limit) || limit < 1) {
      throw new RangeError('limit must be a positive integer');
    }
    const levelId = query.levelId ?? null;

    const stored = await this.scores.listByGame(query.gameId, levelId);
    // Defence in depth for BR-102-1 and BR-102-2 if an adapter filters wrongly.
    const entries = stored.filter(
      (entry) => entry.gameId === query.gameId && entry.levelId === levelId,
    );

    const strategy = this.strategies.get(query.gameId) ?? this.fallback;
    return strategy.rank(entries).slice(0, limit);
  }
}
