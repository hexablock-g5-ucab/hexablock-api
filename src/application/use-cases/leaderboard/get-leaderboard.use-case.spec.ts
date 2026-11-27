import { InMemoryScoreRepository } from '../../../../test/helpers/in-memory-score-repository';
import { aScoreEntry } from '../../../../test/helpers/score-entry.builder';
import type { GameId } from '../../../domain/games/supported-games';
import type { RankedEntry } from '../../../domain/leaderboard/ranked-entry';
import type { IRankingStrategy } from '../../../domain/leaderboard/ranking-strategy';
import type { ScoreEntry } from '../../../domain/leaderboard/score-entry';
import type { ScoreRepository } from '../../ports/score-repository.port';
import {
  DEFAULT_LEADERBOARD_LIMIT,
  GetLeaderboardUseCase,
} from './get-leaderboard.use-case';

/** Ranks by fewer moves only, to tell a registered strategy from the default. */
class FewestMovesRanking implements IRankingStrategy {
  rank(entries: readonly ScoreEntry[]): RankedEntry[] {
    return [...entries]
      .sort((a, b) => a.moves - b.moves)
      .map((entry, index) => ({
        rank: index + 1,
        userId: entry.userId,
        score: entry.score,
        moves: entry.moves,
        elapsedMs: entry.elapsedMs,
        createdAt: entry.createdAt,
      }));
  }
}

const userIds = (rows: RankedEntry[]) => rows.map((row) => row.userId);

describe('GetLeaderboardUseCase', () => {
  it('should_return_an_empty_list_when_the_game_has_no_entries', async () => {
    // Arrange
    const useCase = new GetLeaderboardUseCase(new InMemoryScoreRepository());

    // Act
    const result = await useCase.execute({ gameId: 'hexa-sort' });

    // Assert
    expect(result).toEqual([]);
  });

  it('should_rank_only_entries_of_the_requested_game_when_other_games_have_entries', async () => {
    // Arrange
    const scores = new InMemoryScoreRepository([
      aScoreEntry({ userId: 'sort-player', gameId: 'hexa-sort' }),
      aScoreEntry({
        userId: 'lines-player',
        gameId: 'hexa-lines',
        score: 9999,
      }),
      aScoreEntry({
        userId: 'merge-player',
        gameId: 'hexa-merge',
        score: 9999,
      }),
    ]);
    const useCase = new GetLeaderboardUseCase(scores);

    // Act
    const result = await useCase.execute({ gameId: 'hexa-sort' });

    // Assert
    expect(userIds(result)).toEqual(['sort-player']);
  });

  it('should_rank_only_game_wide_entries_when_levelId_is_omitted', async () => {
    // Arrange
    const scores = new InMemoryScoreRepository([
      aScoreEntry({ userId: 'game-wide', levelId: null, score: 100 }),
      aScoreEntry({ userId: 'level-player', levelId: 'sort-001', score: 9999 }),
    ]);
    const useCase = new GetLeaderboardUseCase(scores);

    // Act
    const result = await useCase.execute({ gameId: 'hexa-sort' });

    // Assert
    expect(userIds(result)).toEqual(['game-wide']);
  });

  it('should_rank_only_that_level_when_levelId_is_given', async () => {
    // Arrange
    const scores = new InMemoryScoreRepository([
      aScoreEntry({ userId: 'level-1', levelId: 'sort-001' }),
      aScoreEntry({ userId: 'level-2', levelId: 'sort-002', score: 9999 }),
      aScoreEntry({ userId: 'game-wide', levelId: null, score: 9999 }),
    ]);
    const useCase = new GetLeaderboardUseCase(scores);

    // Act
    const result = await useCase.execute({
      gameId: 'hexa-sort',
      levelId: 'sort-001',
    });

    // Assert
    expect(userIds(result)).toEqual(['level-1']);
  });

  it('should_drop_other_games_and_levels_when_the_repository_returns_them_by_mistake', async () => {
    // Arrange: a faulty adapter that ignores its filters
    const leaky: ScoreRepository = {
      add: () => Promise.resolve(),
      listByGame: () =>
        Promise.resolve([
          aScoreEntry({
            userId: 'ok',
            gameId: 'hexa-sort',
            levelId: 'sort-001',
          }),
          aScoreEntry({
            userId: 'other-game',
            gameId: 'hexa-merge',
            levelId: 'sort-001',
          }),
          aScoreEntry({
            userId: 'game-wide',
            gameId: 'hexa-sort',
            levelId: null,
          }),
        ]),
    };
    const useCase = new GetLeaderboardUseCase(leaky);

    // Act
    const result = await useCase.execute({
      gameId: 'hexa-sort',
      levelId: 'sort-001',
    });

    // Assert
    expect(userIds(result)).toEqual(['ok']);
  });

  it('should_use_the_strategy_registered_for_the_gameId_when_one_exists', async () => {
    // Arrange: by default 'high-score' wins; by fewer moves 'few-moves' wins
    const scores = new InMemoryScoreRepository([
      aScoreEntry({
        userId: 'high-score',
        gameId: 'hexa-merge',
        score: 900,
        moves: 40,
      }),
      aScoreEntry({
        userId: 'few-moves',
        gameId: 'hexa-merge',
        score: 100,
        moves: 5,
      }),
    ]);
    const strategies = new Map<GameId, IRankingStrategy>([
      ['hexa-merge', new FewestMovesRanking()],
    ]);
    const useCase = new GetLeaderboardUseCase(scores, strategies);

    // Act
    const result = await useCase.execute({ gameId: 'hexa-merge' });

    // Assert
    expect(userIds(result)).toEqual(['few-moves', 'high-score']);
  });

  it('should_fall_back_to_best_score_ranking_when_no_strategy_is_registered_for_the_gameId', async () => {
    // Arrange: a strategy exists, but for another game
    const scores = new InMemoryScoreRepository([
      aScoreEntry({ userId: 'few-moves', score: 100, moves: 5 }),
      aScoreEntry({ userId: 'high-score', score: 900, moves: 40 }),
      aScoreEntry({ userId: 'high-score', score: 300, moves: 1 }),
    ]);
    const strategies = new Map<GameId, IRankingStrategy>([
      ['hexa-merge', new FewestMovesRanking()],
    ]);
    const useCase = new GetLeaderboardUseCase(scores, strategies);

    // Act
    const result = await useCase.execute({ gameId: 'hexa-sort' });

    // Assert
    expect(result.map((row) => [row.rank, row.userId, row.score])).toEqual([
      [1, 'high-score', 900],
      [2, 'few-moves', 100],
    ]);
  });

  it('should_return_the_top_rows_with_their_ranks_when_a_limit_is_given', async () => {
    // Arrange: scores 10..50 inserted lowest first
    const scores = new InMemoryScoreRepository(
      [10, 20, 30, 40, 50].map((score) =>
        aScoreEntry({ userId: `p${score}`, score }),
      ),
    );
    const useCase = new GetLeaderboardUseCase(scores);

    // Act
    const result = await useCase.execute({ gameId: 'hexa-sort', limit: 2 });

    // Assert
    expect(result.map((row) => [row.rank, row.userId])).toEqual([
      [1, 'p50'],
      [2, 'p40'],
    ]);
  });

  it('should_return_at_most_the_default_limit_when_no_limit_is_given', async () => {
    // Arrange: one more player than the default limit
    const scores = new InMemoryScoreRepository(
      Array.from({ length: DEFAULT_LEADERBOARD_LIMIT + 1 }, (_, i) =>
        aScoreEntry({ userId: `p${i}`, score: i }),
      ),
    );
    const useCase = new GetLeaderboardUseCase(scores);

    // Act
    const result = await useCase.execute({ gameId: 'hexa-sort' });

    // Assert
    expect(DEFAULT_LEADERBOARD_LIMIT).toBe(50);
    expect(result).toHaveLength(50);
    expect(result[49]).toMatchObject({ rank: 50, userId: 'p1' });
  });

  it.each([0, -1, 2.5, Number.NaN])(
    'should_reject_the_query_when_limit_is_not_a_positive_integer (%s)',
    async (limit) => {
      // Arrange
      const useCase = new GetLeaderboardUseCase(new InMemoryScoreRepository());

      // Act
      const run = useCase.execute({ gameId: 'hexa-sort', limit });

      // Assert
      await expect(run).rejects.toThrow(RangeError);
    },
  );
});
