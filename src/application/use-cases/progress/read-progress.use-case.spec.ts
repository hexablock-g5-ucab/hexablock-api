import { InMemoryProgressRepository } from '../../../../test/helpers/in-memory-progress-repository';
import { GameProgress } from '../../../domain/progress/game-progress';
import { ReadProgressUseCase } from './read-progress.use-case';

describe('ReadProgressUseCase', () => {
  it('should_return_the_stored_progress_when_the_player_has_progress_for_the_game', async () => {
    // Arrange
    const stored = GameProgress.create({
      userId: 'user-a',
      gameId: 'hexa-sort',
      bestScore: 800,
      data: { coins: 2 },
      levels: [
        {
          levelId: 'sort-001',
          bestScore: 800,
          completedAt: new Date('2026-11-10T08:00:00.000Z'),
          data: {},
        },
      ],
    });
    const repository = new InMemoryProgressRepository().seed(stored);
    const useCase = new ReadProgressUseCase(repository);

    // Act
    const result = await useCase.execute({
      userId: 'user-a',
      gameId: 'hexa-sort',
    });

    // Assert
    expect(result).toBe(stored);
  });

  it('should_return_empty_progress_when_nothing_is_stored', async () => {
    // Arrange
    const useCase = new ReadProgressUseCase(new InMemoryProgressRepository());

    // Act
    const result = await useCase.execute({
      userId: 'user-a',
      gameId: 'hexa-sort',
    });

    // Assert
    expect(result).toMatchObject({
      userId: 'user-a',
      gameId: 'hexa-sort',
      bestScore: 0,
      data: {},
      levels: [],
    });
  });

  it('should_return_empty_progress_when_only_another_player_or_game_has_progress', async () => {
    // Arrange
    const repository = new InMemoryProgressRepository().seed(
      GameProgress.create({
        userId: 'user-b',
        gameId: 'hexa-sort',
        bestScore: 900,
        data: { owner: 'b' },
        levels: [],
      }),
      GameProgress.create({
        userId: 'user-a',
        gameId: 'hexa-lines',
        bestScore: 700,
        data: { owner: 'a-lines' },
        levels: [],
      }),
    );
    const useCase = new ReadProgressUseCase(repository);

    // Act
    const result = await useCase.execute({
      userId: 'user-a',
      gameId: 'hexa-sort',
    });

    // Assert
    expect(result).toMatchObject({ bestScore: 0, data: {}, levels: [] });
    expect(repository.findCalls).toEqual([
      { userId: 'user-a', gameId: 'hexa-sort' },
    ]);
  });
});
