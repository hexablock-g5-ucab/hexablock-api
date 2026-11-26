import { InMemoryProgressRepository } from '../../../../test/helpers/in-memory-progress-repository';
import type { GameId } from '../../../domain/games/supported-games';
import { GameProgress } from '../../../domain/progress/game-progress';
import type { IProgressMergePolicy } from '../../../domain/progress/progress-merge-policy';
import {
  type SyncProgressInput,
  SyncProgressUseCase,
} from './sync-progress.use-case';

const COMPLETED = new Date('2026-11-15T12:00:00.000Z');

/** A non-default policy: keeps the union of the keys of both sides. */
const unionPolicy: IProgressMergePolicy = {
  merge: (stored, incoming) => ({ ...stored, ...incoming }),
};

function input(overrides: Partial<SyncProgressInput> = {}): SyncProgressInput {
  return {
    userId: 'user-b',
    gameId: 'hexa-sort',
    bestScore: 500,
    data: { coins: 4 },
    levels: [{ levelId: 'sort-001', bestScore: 500, completedAt: COMPLETED }],
    ...overrides,
  };
}

function setup(policies = new Map<GameId, IProgressMergePolicy>()) {
  const repository = new InMemoryProgressRepository();
  const useCase = new SyncProgressUseCase(repository, policies);
  return { repository, useCase };
}

describe('SyncProgressUseCase', () => {
  it('should_store_and_return_the_progress_when_it_is_the_first_sync', async () => {
    // Arrange
    const { repository, useCase } = setup();

    // Act
    const result = await useCase.execute(input());

    // Assert
    expect(result).toMatchObject({
      userId: 'user-b',
      gameId: 'hexa-sort',
      bestScore: 500,
      data: { coins: 4 },
    });
    expect(result.levels).toHaveLength(1);
    expect(result.levels[0].completedAt).toEqual(COMPLETED);
    expect(repository.stored('user-b', 'hexa-sort')).toEqual(result);
  });

  it('should_store_the_same_progress_when_the_same_sync_is_repeated', async () => {
    // Arrange
    const { repository, useCase } = setup();
    const first = await useCase.execute(input());

    // Act
    const second = await useCase.execute(input());

    // Assert
    expect(second).toEqual(first);
    expect(repository.stored('user-b', 'hexa-sort')).toEqual(first);
  });

  it('should_not_lower_stored_progress_when_the_incoming_progress_is_worse', async () => {
    // Arrange
    const { repository, useCase } = setup();
    await useCase.execute(input());

    // Act
    const result = await useCase.execute(
      input({
        bestScore: 10,
        data: undefined,
        levels: [{ levelId: 'sort-001', bestScore: 10, completedAt: null }],
      }),
    );

    // Assert
    expect(result.bestScore).toBe(500);
    expect(result.data).toEqual({ coins: 4 });
    expect(result.levels[0]).toMatchObject({ bestScore: 500, completed: true });
    expect(repository.stored('user-b', 'hexa-sort')).toEqual(result);
  });

  it('should_keep_the_stored_progress_when_a_fresh_client_syncs_empty_progress', async () => {
    // Arrange
    const { repository, useCase } = setup();
    const stored = await useCase.execute(input());

    // Act
    const result = await useCase.execute(
      input({ bestScore: 0, data: {}, levels: undefined }),
    );

    // Assert
    expect(result).toEqual(stored);
    expect(result.data).toEqual({ coins: 4 });
    expect(repository.stored('user-b', 'hexa-sort')).toEqual(stored);
  });

  it('should_use_the_registered_policy_when_the_gameId_has_one', async () => {
    // Arrange
    const { repository, useCase } = setup(
      new Map([['hexa-sort', unionPolicy]]),
    );
    repository.seed(
      GameProgress.create({
        userId: 'user-b',
        gameId: 'hexa-sort',
        bestScore: 0,
        data: { theme: 'dark' },
        levels: [],
      }),
    );

    // Act
    const result = await useCase.execute(input({ data: { coins: 4 } }));

    // Assert
    expect(result.data).toEqual({ theme: 'dark', coins: 4 });
  });

  it('should_use_KeepLatestDataPolicy_when_the_gameId_has_no_registered_policy', async () => {
    // Arrange
    const { repository, useCase } = setup(
      new Map([['hexa-sort', unionPolicy]]),
    );
    repository.seed(
      GameProgress.create({
        userId: 'user-b',
        gameId: 'hexa-lines',
        bestScore: 0,
        data: { theme: 'dark' },
        levels: [],
      }),
    );

    // Act
    const result = await useCase.execute(
      input({ gameId: 'hexa-lines', data: { coins: 4 }, levels: undefined }),
    );

    // Assert
    expect(result.data).toEqual({ coins: 4 });
  });

  it('should_only_read_and_change_the_player_and_game_of_the_input_when_others_have_progress', async () => {
    // Arrange
    const { repository, useCase } = setup();
    const playerA = GameProgress.create({
      userId: 'user-a',
      gameId: 'hexa-sort',
      bestScore: 9000,
      data: { owner: 'a' },
      levels: [
        {
          levelId: 'sort-009',
          bestScore: 9000,
          completedAt: COMPLETED,
          data: {},
        },
      ],
    });
    const otherGame = GameProgress.create({
      userId: 'user-b',
      gameId: 'hexa-lines',
      bestScore: 7000,
      data: { owner: 'b-lines' },
      levels: [],
    });
    repository.seed(playerA, otherGame);

    // Act
    const result = await useCase.execute(input());

    // Assert
    expect(repository.findCalls).toEqual([
      { userId: 'user-b', gameId: 'hexa-sort' },
    ]);
    expect(repository.saveCalls.map((p) => [p.userId, p.gameId])).toEqual([
      ['user-b', 'hexa-sort'],
    ]);
    expect(repository.stored('user-a', 'hexa-sort')).toBe(playerA);
    expect(repository.stored('user-b', 'hexa-lines')).toBe(otherGame);
    expect(result.bestScore).toBe(500);
    expect(result.data).toEqual({ coins: 4 });
    expect(result.levels.map((level) => level.levelId)).toEqual(['sort-001']);
  });
});
