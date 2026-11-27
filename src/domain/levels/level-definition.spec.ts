import { aLevel, sortSpec } from '../../../test/helpers/level.builder';
import { LevelDefinition, type LevelContent } from './level-definition';
import { InvalidLevelBoardError } from './level-errors';

function contentOf(level: LevelDefinition): LevelContent {
  return {
    schemaVersion: level.schemaVersion,
    order: level.order,
    difficulty: level.difficulty,
    board: level.board,
    spec: level.spec,
  };
}

describe('LevelDefinition', () => {
  describe('create', () => {
    it('should_throw_InvalidLevelBoardError_when_the_board_is_invalid', () => {
      // Arrange
      const board = { shape: 'hexagon', radius: 0 } as const;

      // Act
      const act = () => aLevel({ board });

      // Assert
      expect(act).toThrow(InvalidLevelBoardError);
    });

    it('should_not_change_when_the_caller_mutates_the_board_and_spec_it_passed', () => {
      // Arrange
      const board = { shape: 'custom' as const, cells: [[0, 0] as const] };
      const spec = sortSpec();
      const level = aLevel({ board, spec });

      // Act
      (board.cells as unknown as number[][]).push([1, 1]);
      (spec.goal as Record<string, unknown>).target = 9;
      spec.seed = 7;

      // Assert
      expect(level.board).toEqual({ shape: 'custom', cells: [[0, 0]] });
      expect(level.spec).toEqual(sortSpec());
    });

    it('should_be_deeply_frozen_when_created', () => {
      // Arrange
      const level = aLevel({
        board: { shape: 'custom', cells: [[0, 0]] },
      });

      // Act / Assert
      expect(Object.isFrozen(level)).toBe(true);
      expect(Object.isFrozen(level.board)).toBe(true);
      expect(
        Object.isFrozen(
          (level.board as { readonly cells: readonly unknown[] }).cells,
        ),
      ).toBe(true);
      expect(Object.isFrozen(level.spec)).toBe(true);
      expect(Object.isFrozen(level.spec.goal)).toBe(true);
      expect(Object.isFrozen(level.spec.colors)).toBe(true);
    });

    it('should_throw_when_code_assigns_to_a_frozen_field', () => {
      // Arrange
      const level = aLevel();

      // Act
      const act = () => {
        (level as { order: number }).order = 2;
      };

      // Assert
      expect(act).toThrow(TypeError);
      expect(level.order).toBe(1);
    });
  });

  describe('revise', () => {
    it('should_return_the_same_level_when_the_content_is_identical', () => {
      // Arrange
      const stored = aLevel({ version: 4 });

      // Act
      const revised = stored.revise(contentOf(stored));

      // Assert
      expect(revised).toBe(stored);
    });

    it('should_ignore_object_key_order_when_comparing_content', () => {
      // Arrange
      const stored = aLevel({ version: 4 });
      const reordered: LevelContent = {
        ...contentOf(stored),
        board: { radius: 3, shape: 'hexagon' },
        spec: {
          seed: 42,
          colors: ['red', 'blue'],
          goal: { target: 500, type: 'score' },
        },
      };

      // Act
      const revised = stored.revise(reordered);

      // Assert
      expect(revised).toBe(stored);
    });

    it.each<[string, Partial<LevelContent>]>([
      ['the order', { order: 2 }],
      ['the difficulty', { difficulty: 'hard' }],
      ['the difficulty to none', { difficulty: null }],
      ['the board', { board: { shape: 'hexagon', radius: 4 } }],
      ['the spec', { spec: sortSpec({ seed: 43 }) }],
      ['the color order', { spec: sortSpec({ colors: ['blue', 'red'] }) }],
    ])('should_raise_the_version_by_one_when_%s_changes', (_case, change) => {
      // Arrange
      const stored = aLevel({ version: 4 });

      // Act
      const revised = stored.revise({ ...contentOf(stored), ...change });

      // Assert
      expect(revised.version).toBe(5);
      expect(revised).toMatchObject({
        gameId: stored.gameId,
        levelId: stored.levelId,
        ...change,
      });
    });

    it('should_raise_the_version_by_one_when_the_schema_version_changes', () => {
      // Arrange
      const stored = aLevel({ version: 4 });

      // Act
      const revised = stored.revise({ ...contentOf(stored), schemaVersion: 2 });

      // Assert
      expect(revised.version).toBe(5);
    });
  });
});
