import { FixedClock } from '../../../../test/helpers/fixed-clock';
import { InMemoryScoreRepository } from '../../../../test/helpers/in-memory-score-repository';
import { aScoreEntry } from '../../../../test/helpers/score-entry.builder';
import { SubmitScoreUseCase } from './submit-score.use-case';

const NOW = new Date('2026-11-27T12:34:56.000Z');

describe('SubmitScoreUseCase', () => {
  it('should_store_the_entry_with_the_clock_time_and_the_given_player_when_a_score_is_submitted', async () => {
    // Arrange
    const scores = new InMemoryScoreRepository();
    const useCase = new SubmitScoreUseCase(scores, new FixedClock(NOW));

    // Act
    const result = await useCase.execute({
      userId: 'player-42',
      gameId: 'hexa-sort',
      levelId: 'sort-001',
      score: 4500,
      moves: 37,
      elapsedMs: 95_000,
    });

    // Assert
    expect(scores.all()).toEqual([result]);
    expect(result).toMatchObject({
      userId: 'player-42',
      gameId: 'hexa-sort',
      levelId: 'sort-001',
      score: 4500,
      moves: 37,
      elapsedMs: 95_000,
    });
    expect(result.createdAt).toEqual(NOW);
  });

  it('should_store_a_game_wide_entry_when_levelId_is_omitted', async () => {
    // Arrange
    const scores = new InMemoryScoreRepository();
    const useCase = new SubmitScoreUseCase(scores, new FixedClock(NOW));

    // Act
    const result = await useCase.execute({
      userId: 'player-42',
      gameId: 'hexa-lines',
      score: 800,
      moves: 50,
      elapsedMs: 120_000,
    });

    // Assert
    expect(result.levelId).toBeNull();
    expect(scores.all()[0].levelId).toBeNull();
  });

  it('should_leave_other_players_entries_unchanged_when_a_score_is_submitted', async () => {
    // Arrange
    const existing = aScoreEntry({ userId: 'other-player', score: 9000 });
    const scores = new InMemoryScoreRepository([existing]);
    const useCase = new SubmitScoreUseCase(scores, new FixedClock(NOW));

    // Act
    await useCase.execute({
      userId: 'player-42',
      gameId: 'hexa-sort',
      score: 100,
      moves: 5,
      elapsedMs: 1_000,
    });

    // Assert
    const stored = scores.all();
    expect(stored).toHaveLength(2);
    expect(stored[0]).toBe(existing);
    expect(stored[0]).toEqual(
      aScoreEntry({ userId: 'other-player', score: 9000 }),
    );
  });
});
