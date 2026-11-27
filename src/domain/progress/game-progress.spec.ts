import {
  GameProgress,
  type GameProgressProps,
  type IncomingProgress,
  mergeMonotonic,
} from './game-progress';
import { KeepLatestDataPolicy } from './keep-latest-data.policy';
import type { LevelProgressProps } from './level-progress';
import type {
  IProgressMergePolicy,
  ProgressData,
} from './progress-merge-policy';

const EARLY = new Date('2026-11-01T10:00:00.000Z');
const LATE = new Date('2026-11-20T10:00:00.000Z');
const keepLatest = new KeepLatestDataPolicy();

function level(
  levelId: string,
  overrides: Partial<LevelProgressProps> = {},
): LevelProgressProps {
  return { levelId, bestScore: 0, completedAt: null, data: {}, ...overrides };
}

function progress(overrides: Partial<GameProgressProps> = {}): GameProgress {
  return GameProgress.create({
    userId: 'user-a',
    gameId: 'hexa-sort',
    bestScore: 0,
    data: {},
    levels: [],
    ...overrides,
  });
}

function levelOf(result: GameProgress, levelId: string) {
  return result.levels.find((item) => item.levelId === levelId);
}

describe('mergeMonotonic', () => {
  it('should_take_the_incoming_bestScore_when_it_is_higher', () => {
    // Arrange
    const stored = progress({ bestScore: 100 });

    // Act
    const result = mergeMonotonic(stored, { bestScore: 250 }, keepLatest);

    // Assert
    expect(result.bestScore).toBe(250);
  });

  it('should_keep_the_stored_bestScore_when_the_incoming_one_is_lower', () => {
    // Arrange
    const stored = progress({ bestScore: 250 });

    // Act
    const result = mergeMonotonic(stored, { bestScore: 100 }, keepLatest);

    // Assert
    expect(result.bestScore).toBe(250);
  });

  it('should_keep_the_maximum_bestScore_per_level_when_both_sides_have_the_level', () => {
    // Arrange
    const stored = progress({
      levels: [
        level('sort-001', { bestScore: 300 }),
        level('sort-002', { bestScore: 100 }),
      ],
    });
    const incoming: IncomingProgress = {
      bestScore: 0,
      levels: [
        { levelId: 'sort-001', bestScore: 200 },
        { levelId: 'sort-002', bestScore: 400 },
      ],
    };

    // Act
    const result = mergeMonotonic(stored, incoming, keepLatest);

    // Assert
    expect(levelOf(result, 'sort-001')?.bestScore).toBe(300);
    expect(levelOf(result, 'sort-002')?.bestScore).toBe(400);
  });

  it('should_return_the_union_of_levels_sorted_by_levelId_when_each_side_has_other_levels', () => {
    // Arrange
    const stored = progress({
      levels: [level('sort-003', { bestScore: 50, completedAt: EARLY })],
    });
    const incoming: IncomingProgress = {
      bestScore: 0,
      levels: [{ levelId: 'sort-001', bestScore: 80, completedAt: LATE }],
    };

    // Act
    const result = mergeMonotonic(stored, incoming, keepLatest);

    // Assert
    expect(result.levels.map((item) => item.levelId)).toEqual([
      'sort-001',
      'sort-003',
    ]);
    expect(levelOf(result, 'sort-001')?.completedAt).toEqual(LATE);
    expect(levelOf(result, 'sort-003')?.completedAt).toEqual(EARLY);
  });

  it.each([
    ['stored is earlier', EARLY, LATE],
    ['incoming is earlier', LATE, EARLY],
  ])(
    'should_keep_the_earliest_completedAt_when_both_sides_completed_the_level (%s)',
    (_case, storedAt, incomingAt) => {
      // Arrange
      const stored = progress({
        levels: [level('sort-001', { completedAt: storedAt })],
      });
      const incoming: IncomingProgress = {
        bestScore: 0,
        levels: [
          { levelId: 'sort-001', bestScore: 0, completedAt: incomingAt },
        ],
      };

      // Act
      const result = mergeMonotonic(stored, incoming, keepLatest);

      // Assert
      expect(levelOf(result, 'sort-001')?.completedAt).toEqual(EARLY);
    },
  );

  it.each([
    ['completedAt is null', null],
    ['completedAt is absent', undefined],
  ])(
    'should_keep_a_level_completed_when_the_incoming_level_is_not_completed (%s)',
    (_case, completedAt) => {
      // Arrange
      const stored = progress({
        levels: [level('sort-001', { bestScore: 90, completedAt: EARLY })],
      });
      const incoming: IncomingProgress = {
        bestScore: 0,
        levels: [{ levelId: 'sort-001', bestScore: 10, completedAt }],
      };

      // Act
      const result = mergeMonotonic(stored, incoming, keepLatest);

      // Assert
      expect(levelOf(result, 'sort-001')?.completed).toBe(true);
      expect(levelOf(result, 'sort-001')?.completedAt).toEqual(EARLY);
      expect(levelOf(result, 'sort-001')?.bestScore).toBe(90);
    },
  );

  it('should_complete_a_stored_level_when_the_incoming_level_is_completed_for_the_first_time', () => {
    // Arrange
    const stored = progress({ levels: [level('sort-001', { bestScore: 10 })] });
    const incoming: IncomingProgress = {
      bestScore: 0,
      levels: [{ levelId: 'sort-001', bestScore: 10, completedAt: LATE }],
    };

    // Act
    const result = mergeMonotonic(stored, incoming, keepLatest);

    // Assert
    expect(levelOf(result, 'sort-001')?.completedAt).toEqual(LATE);
  });

  it('should_merge_repeated_levelIds_when_the_incoming_progress_repeats_a_level', () => {
    // Arrange
    const stored = progress();
    const incoming: IncomingProgress = {
      bestScore: 0,
      levels: [
        { levelId: 'sort-001', bestScore: 70, completedAt: LATE },
        { levelId: 'sort-001', bestScore: 40, completedAt: EARLY },
      ],
    };

    // Act
    const result = mergeMonotonic(stored, incoming, keepLatest);

    // Assert
    expect(result.levels).toHaveLength(1);
    expect(levelOf(result, 'sort-001')?.bestScore).toBe(70);
    expect(levelOf(result, 'sort-001')?.completedAt).toEqual(EARLY);
  });

  it('should_give_the_same_result_when_the_same_input_is_merged_twice', () => {
    // Arrange
    const stored = progress({
      bestScore: 120,
      data: { coins: 3 },
      levels: [level('sort-002', { bestScore: 60, completedAt: LATE })],
    });
    const incoming: IncomingProgress = {
      bestScore: 200,
      data: { coins: 5 },
      levels: [
        { levelId: 'sort-001', bestScore: 30, completedAt: EARLY },
        { levelId: 'sort-002', bestScore: 10, data: { hint: true } },
      ],
    };
    const once = mergeMonotonic(stored, incoming, keepLatest);

    // Act
    const twice = mergeMonotonic(once, incoming, keepLatest);

    // Assert
    expect(twice).toEqual(once);
  });

  it('should_merge_game_and_level_data_with_the_given_policy', () => {
    // Arrange
    const calls: [ProgressData, ProgressData | undefined][] = [];
    const unionPolicy: IProgressMergePolicy = {
      merge: (stored, incoming) => {
        calls.push([stored, incoming]);
        return { ...stored, ...incoming };
      },
    };
    const stored = progress({
      data: { unlocked: ['a'], theme: 'dark' },
      levels: [level('sort-001', { data: { tries: 1 } })],
    });
    const incoming: IncomingProgress = {
      bestScore: 0,
      data: { theme: 'light' },
      levels: [{ levelId: 'sort-001', bestScore: 0, data: { hint: true } }],
    };

    // Act
    const result = mergeMonotonic(stored, incoming, unionPolicy);

    // Assert
    expect(calls).toHaveLength(2);
    expect(result.data).toEqual({ unlocked: ['a'], theme: 'light' });
    expect(levelOf(result, 'sort-001')?.data).toEqual({ tries: 1, hint: true });
  });

  it('should_keep_the_owner_and_gameId_of_the_stored_progress', () => {
    // Arrange
    const stored = progress({ userId: 'user-b', gameId: 'hexa-lines' });

    // Act
    const result = mergeMonotonic(stored, { bestScore: 10 }, keepLatest);

    // Assert
    expect(result.userId).toBe('user-b');
    expect(result.gameId).toBe('hexa-lines');
  });

  it('should_not_change_the_stored_progress_when_merging', () => {
    // Arrange
    const stored = progress({ bestScore: 5, data: { coins: 1 } });

    // Act
    stored.mergeMonotonic({ bestScore: 50, data: { coins: 9 } }, keepLatest);

    // Assert
    expect(stored.bestScore).toBe(5);
    expect(stored.data).toEqual({ coins: 1 });
  });
});

describe('GameProgress', () => {
  it('should_return_empty_progress_when_created_empty', () => {
    // Arrange + Act
    const result = GameProgress.empty('user-a', 'hexa-merge');

    // Assert
    expect(result).toMatchObject({
      userId: 'user-a',
      gameId: 'hexa-merge',
      bestScore: 0,
      data: {},
      levels: [],
    });
  });

  it('should_not_share_mutable_state_when_the_caller_mutates_inputs_or_outputs', () => {
    // Arrange
    const data = { nested: { coins: 1 } };
    const completedAt = new Date(EARLY);
    const result = progress({
      data,
      levels: [level('sort-001', { completedAt })],
    });

    // Act
    data.nested.coins = 99;
    completedAt.setTime(0);
    levelOf(result, 'sort-001')?.completedAt?.setTime(0);

    // Assert
    expect(result.data).toEqual({ nested: { coins: 1 } });
    expect(levelOf(result, 'sort-001')?.completedAt).toEqual(EARLY);
    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(result.levels)).toBe(true);
    expect(Object.isFrozen(result.data.nested)).toBe(true);
  });

  it('should_throw_when_two_levels_share_a_levelId', () => {
    // Arrange
    const levels = [level('sort-001'), level('sort-001')];

    // Act + Assert
    expect(() => progress({ levels })).toThrow(/same levelId/);
  });
});
