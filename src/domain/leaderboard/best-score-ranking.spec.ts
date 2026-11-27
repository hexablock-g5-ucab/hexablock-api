import { aScoreEntry } from '../../../test/helpers/score-entry.builder';
import { BestScoreRanking } from './best-score-ranking';

const at = (iso: string) => new Date(`2026-11-27T${iso}.000Z`);

describe('BestScoreRanking', () => {
  const ranking = new BestScoreRanking();

  it('should_return_an_empty_list_when_there_are_no_entries', () => {
    // Arrange: no entries. Act
    const result = ranking.rank([]);

    // Assert
    expect(result).toEqual([]);
  });

  it('should_order_by_higher_score_first_when_scores_differ', () => {
    // Arrange: the lower score has better moves, time and date
    const entries = [
      aScoreEntry({
        userId: 'low',
        score: 100,
        moves: 1,
        elapsedMs: 1,
        createdAt: at('08:00:00'),
      }),
      aScoreEntry({
        userId: 'high',
        score: 200,
        moves: 99,
        elapsedMs: 99_000,
        createdAt: at('12:00:00'),
      }),
    ];

    // Act
    const result = ranking.rank(entries);

    // Assert
    expect(result.map((row) => row.userId)).toEqual(['high', 'low']);
  });

  it('should_order_by_fewer_moves_when_scores_are_equal', () => {
    // Arrange
    const entries = [
      aScoreEntry({
        userId: 'more-moves',
        moves: 30,
        elapsedMs: 1,
        createdAt: at('08:00:00'),
      }),
      aScoreEntry({
        userId: 'fewer-moves',
        moves: 10,
        elapsedMs: 99_000,
        createdAt: at('12:00:00'),
      }),
    ];

    // Act
    const result = ranking.rank(entries);

    // Assert
    expect(result.map((row) => row.userId)).toEqual([
      'fewer-moves',
      'more-moves',
    ]);
  });

  it('should_order_by_less_elapsed_time_when_score_and_moves_are_equal', () => {
    // Arrange
    const entries = [
      aScoreEntry({
        userId: 'slow',
        elapsedMs: 90_000,
        createdAt: at('08:00:00'),
      }),
      aScoreEntry({
        userId: 'fast',
        elapsedMs: 30_000,
        createdAt: at('12:00:00'),
      }),
    ];

    // Act
    const result = ranking.rank(entries);

    // Assert
    expect(result.map((row) => row.userId)).toEqual(['fast', 'slow']);
  });

  it('should_order_by_earlier_createdAt_when_score_moves_and_time_are_equal', () => {
    // Arrange
    const entries = [
      aScoreEntry({ userId: 'later', createdAt: at('12:00:00') }),
      aScoreEntry({ userId: 'earlier', createdAt: at('08:00:00') }),
    ];

    // Act
    const result = ranking.rank(entries);

    // Assert
    expect(result.map((row) => row.userId)).toEqual(['earlier', 'later']);
  });

  it('should_keep_input_order_and_distinct_ranks_when_all_keys_are_equal', () => {
    // Arrange: three players with identical results
    const entries = ['c', 'a', 'b'].map((userId) => aScoreEntry({ userId }));

    // Act
    const result = ranking.rank(entries);

    // Assert
    expect(result.map((row) => [row.rank, row.userId])).toEqual([
      [1, 'c'],
      [2, 'a'],
      [3, 'b'],
    ]);
  });

  it('should_return_one_row_per_player_with_their_best_entry_when_a_player_has_several', () => {
    // Arrange
    const entries = [
      aScoreEntry({ userId: 'ana', score: 300 }),
      aScoreEntry({ userId: 'bob', score: 400 }),
      aScoreEntry({ userId: 'ana', score: 500, moves: 12, elapsedMs: 40_000 }),
      aScoreEntry({ userId: 'ana', score: 100 }),
    ];

    // Act
    const result = ranking.rank(entries);

    // Assert
    expect(result).toEqual([
      {
        rank: 1,
        userId: 'ana',
        score: 500,
        moves: 12,
        elapsedMs: 40_000,
        createdAt: at('10:00:00'),
      },
      {
        rank: 2,
        userId: 'bob',
        score: 400,
        moves: 20,
        elapsedMs: 60_000,
        createdAt: at('10:00:00'),
      },
    ]);
  });

  it('should_pick_the_best_entry_of_a_player_by_the_same_tie_breaks_when_scores_are_equal', () => {
    // Arrange: same score; the second entry wins on moves
    const entries = [
      aScoreEntry({ userId: 'ana', moves: 25 }),
      aScoreEntry({ userId: 'ana', moves: 15 }),
    ];

    // Act
    const result = ranking.rank(entries);

    // Assert
    expect(result).toHaveLength(1);
    expect(result[0].moves).toBe(15);
  });

  it('should_return_one_row_with_the_earliest_entry_when_a_player_resubmits_an_identical_score', () => {
    // Arrange: the same result sent twice, then a third time at the same instant
    const entries = [
      aScoreEntry({ userId: 'ana', createdAt: at('10:05:00') }),
      aScoreEntry({ userId: 'ana', createdAt: at('10:00:00') }),
      aScoreEntry({ userId: 'ana', createdAt: at('10:00:00') }),
    ];

    // Act
    const result = ranking.rank(entries);

    // Assert
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ rank: 1, userId: 'ana' });
    expect(result[0].createdAt).toEqual(at('10:00:00'));
  });

  it('should_number_ranks_from_one_without_gaps_when_ranking_several_players', () => {
    // Arrange
    const entries = [
      aScoreEntry({ userId: 'a', score: 10 }),
      aScoreEntry({ userId: 'b', score: 30 }),
      aScoreEntry({ userId: 'c', score: 20 }),
    ];

    // Act
    const result = ranking.rank(entries);

    // Assert
    expect(result.map((row) => [row.rank, row.userId])).toEqual([
      [1, 'b'],
      [2, 'c'],
      [3, 'a'],
    ]);
  });
});
