import { InMemoryLevelRepository } from '../../../../test/helpers/in-memory-level-repository';
import { aLevel, sortSpec } from '../../../../test/helpers/level.builder';
import type { GameId } from '../../../domain/games/supported-games';
import {
  InvalidLevelBoardError,
  InvalidLevelSpecError,
} from '../../../domain/levels/level-errors';
import type { ILevelSpecValidator } from '../../../domain/levels/level-spec-validator';
import { SortLevelSpecValidator } from '../../../domain/levels/sort-level-spec.validator';
import { UnsupportedLevelGameError } from '../../errors/unsupported-level-game.error';
import { UnsupportedSchemaVersionError } from '../../errors/unsupported-schema-version.error';
import {
  UpsertLevelUseCase,
  type UpsertLevelInput,
} from './upsert-level.use-case';

const VALIDATORS = new Map<GameId, ILevelSpecValidator>([
  ['hexa-sort', new SortLevelSpecValidator()],
]);

function publish(overrides: Partial<UpsertLevelInput> = {}): UpsertLevelInput {
  return {
    gameId: 'hexa-sort',
    levelId: 'sort-001',
    schemaVersion: 1,
    order: 1,
    difficulty: 'easy',
    board: { shape: 'hexagon', radius: 3 },
    spec: sortSpec(),
    ...overrides,
  };
}

describe('UpsertLevelUseCase', () => {
  it('should_store_version_1_when_the_level_is_new', async () => {
    // Arrange
    const repository = new InMemoryLevelRepository();
    const useCase = new UpsertLevelUseCase(repository, VALIDATORS);

    // Act
    const result = await useCase.execute(publish());

    // Assert
    expect(result).toMatchObject({
      gameId: 'hexa-sort',
      levelId: 'sort-001',
      schemaVersion: 1,
      version: 1,
      order: 1,
      difficulty: 'easy',
      board: { shape: 'hexagon', radius: 3 },
      spec: sortSpec(),
    });
    expect(repository.saveCalls).toEqual([result]);
    expect(repository.stored('hexa-sort', 'sort-001')).toBe(result);
  });

  it('should_store_board_and_spec_in_one_save_when_publishing', async () => {
    // Arrange
    const repository = new InMemoryLevelRepository();
    const useCase = new UpsertLevelUseCase(repository, VALIDATORS);
    const board = {
      shape: 'custom',
      cells: [
        [0, 0],
        [1, 0],
      ],
    };
    const spec = sortSpec({ goal: { type: 'colors', required: { red: 2 } } });

    // Act
    await useCase.execute(publish({ board, spec }));

    // Assert
    expect(repository.saveCalls).toHaveLength(1);
    expect(repository.saveCalls[0]).toMatchObject({ board, spec });
  });

  it('should_store_no_difficulty_when_it_is_omitted', async () => {
    // Arrange
    const useCase = new UpsertLevelUseCase(
      new InMemoryLevelRepository(),
      VALIDATORS,
    );
    const { difficulty: _omitted, ...withoutDifficulty } = publish();

    // Act
    const result = await useCase.execute(withoutDifficulty);

    // Assert
    expect(result.difficulty).toBeNull();
  });

  it('should_raise_the_version_by_one_when_the_content_changed', async () => {
    // Arrange
    const repository = new InMemoryLevelRepository().seed(
      aLevel({ version: 3 }),
    );
    const useCase = new UpsertLevelUseCase(repository, VALIDATORS);

    // Act
    const result = await useCase.execute(
      publish({ spec: sortSpec({ seed: 99 }) }),
    );

    // Assert
    expect(result.version).toBe(4);
    expect(result.spec.seed).toBe(99);
    expect(repository.stored('hexa-sort', 'sort-001')).toBe(result);
  });

  it('should_keep_the_version_and_skip_the_save_when_the_republish_is_identical', async () => {
    // Arrange
    const stored = aLevel({ version: 3 });
    const repository = new InMemoryLevelRepository().seed(stored);
    const useCase = new UpsertLevelUseCase(repository, VALIDATORS);

    // Act
    const first = await useCase.execute(publish());
    const second = await useCase.execute(publish());

    // Assert
    expect(first).toBe(stored);
    expect(second).toBe(stored);
    expect(stored.version).toBe(3);
    expect(repository.saveCalls).toHaveLength(0);
  });

  it('should_raise_the_version_when_a_republish_clears_the_difficulty', async () => {
    // Arrange
    const repository = new InMemoryLevelRepository().seed(
      aLevel({ version: 3, difficulty: 'easy' }),
    );
    const useCase = new UpsertLevelUseCase(repository, VALIDATORS);

    // Act
    const result = await useCase.execute(publish({ difficulty: undefined }));

    // Assert
    expect(result).toMatchObject({ version: 4, difficulty: null });
  });

  it('should_look_up_the_level_by_game_and_level_id_when_another_game_uses_the_same_level_id', async () => {
    // Arrange
    const repository = new InMemoryLevelRepository().seed(
      aLevel({ gameId: 'hexa-merge', version: 7 }),
    );
    const useCase = new UpsertLevelUseCase(repository, VALIDATORS);

    // Act
    const result = await useCase.execute(publish());

    // Assert
    expect(repository.findCalls).toEqual([
      { gameId: 'hexa-sort', levelId: 'sort-001' },
    ]);
    expect(result.version).toBe(1);
    expect(repository.stored('hexa-merge', 'sort-001')?.version).toBe(7);
  });

  it.each<GameId>(['hexa-lines', 'hexa-merge'])(
    'should_throw_UnsupportedLevelGameError_when_the_game_is_%s',
    async (gameId) => {
      // Arrange
      const repository = new InMemoryLevelRepository();
      const useCase = new UpsertLevelUseCase(repository, VALIDATORS);

      // Act
      const act = useCase.execute(publish({ gameId }));

      // Assert
      await expect(act).rejects.toThrow(UnsupportedLevelGameError);
      expect(repository.findCalls).toHaveLength(0);
      expect(repository.saveCalls).toHaveLength(0);
    },
  );

  it.each([0, 2])(
    'should_throw_UnsupportedSchemaVersionError_when_the_schema_version_is_%i',
    async (schemaVersion) => {
      // Arrange
      const repository = new InMemoryLevelRepository();
      const useCase = new UpsertLevelUseCase(repository, VALIDATORS);

      // Act
      const act = useCase.execute(publish({ schemaVersion }));

      // Assert
      await expect(act).rejects.toThrow(UnsupportedSchemaVersionError);
      expect(repository.saveCalls).toHaveLength(0);
    },
  );

  it('should_throw_InvalidLevelBoardError_when_the_board_is_invalid', async () => {
    // Arrange
    const repository = new InMemoryLevelRepository();
    const useCase = new UpsertLevelUseCase(repository, VALIDATORS);

    // Act
    const act = useCase.execute(
      publish({ board: { shape: 'custom', cells: [] } }),
    );

    // Assert
    await expect(act).rejects.toThrow(InvalidLevelBoardError);
    expect(repository.saveCalls).toHaveLength(0);
  });

  it('should_throw_InvalidLevelSpecError_when_the_spec_breaks_the_game_rules', async () => {
    // Arrange
    const repository = new InMemoryLevelRepository().seed(
      aLevel({ version: 3 }),
    );
    const useCase = new UpsertLevelUseCase(repository, VALIDATORS);

    // Act
    const act = useCase.execute(
      publish({ spec: sortSpec({ goal: undefined }) }),
    );

    // Assert
    await expect(act).rejects.toThrow(InvalidLevelSpecError);
    expect(repository.saveCalls).toHaveLength(0);
    expect(repository.stored('hexa-sort', 'sort-001')?.version).toBe(3);
  });

  it('should_throw_InvalidLevelSpecError_when_the_spec_is_not_an_object_whatever_the_validator', async () => {
    // Arrange
    const permissive: ILevelSpecValidator = {
      gameId: 'hexa-sort',
      validate: () => undefined,
    };
    const useCase = new UpsertLevelUseCase(
      new InMemoryLevelRepository(),
      new Map([['hexa-sort', permissive]]),
    );

    // Act
    const act = useCase.execute(publish({ spec: ['goal'] }));

    // Assert
    await expect(act).rejects.toThrow(InvalidLevelSpecError);
  });

  it('should_use_the_validator_registered_for_the_game_when_one_is_added', async () => {
    // Arrange: a hypothetical level-based variant plugs in its own rules
    const validate = jest.fn();
    const lines: ILevelSpecValidator = { gameId: 'hexa-lines', validate };
    const repository = new InMemoryLevelRepository();
    const useCase = new UpsertLevelUseCase(
      repository,
      new Map([...VALIDATORS, ['hexa-lines', lines]]),
    );
    const spec = { rows: 9 };

    // Act
    const result = await useCase.execute(
      publish({ gameId: 'hexa-lines', levelId: 'lines-001', spec }),
    );

    // Assert
    expect(validate).toHaveBeenCalledWith(spec);
    expect(result).toMatchObject({ gameId: 'hexa-lines', version: 1, spec });
  });

  it('should_throw_when_a_validator_is_registered_under_another_game_id', () => {
    // Arrange
    const misregistered = new Map<GameId, ILevelSpecValidator>([
      ['hexa-merge', new SortLevelSpecValidator()],
    ]);

    // Act
    const act = () =>
      new UpsertLevelUseCase(new InMemoryLevelRepository(), misregistered);

    // Assert
    expect(act).toThrow('wrong gameId');
  });
});
