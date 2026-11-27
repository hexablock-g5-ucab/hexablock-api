import { InMemoryLevelRepository } from '../../../../test/helpers/in-memory-level-repository';
import { aLevel } from '../../../../test/helpers/level.builder';
import type { GameId } from '../../../domain/games/supported-games';
import type { ILevelSpecValidator } from '../../../domain/levels/level-spec-validator';
import { SortLevelSpecValidator } from '../../../domain/levels/sort-level-spec.validator';
import { UnsupportedLevelGameError } from '../../errors/unsupported-level-game.error';
import { GetLevelsUseCase } from './get-levels.use-case';

const VALIDATORS = new Map<GameId, ILevelSpecValidator>([
  ['hexa-sort', new SortLevelSpecValidator()],
]);

describe('GetLevelsUseCase', () => {
  it('should_return_the_levels_ordered_by_order_then_level_id_when_levels_exist', async () => {
    // Arrange
    const repository = new InMemoryLevelRepository().seed(
      aLevel({ levelId: 'sort-003', order: 2 }),
      aLevel({ levelId: 'sort-010', order: 1 }),
      aLevel({ levelId: 'sort-002', order: 2 }),
      aLevel({ levelId: 'sort-001', order: 3 }),
    );
    const useCase = new GetLevelsUseCase(repository, VALIDATORS);

    // Act
    const result = await useCase.execute({ gameId: 'hexa-sort' });

    // Assert
    expect(result.map((level) => level.levelId)).toEqual([
      'sort-010',
      'sort-002',
      'sort-003',
      'sort-001',
    ]);
  });

  it('should_return_only_the_levels_of_the_requested_game_when_another_game_has_levels', async () => {
    // Arrange
    const sortLevel = aLevel({ levelId: 'sort-001' });
    const repository = new InMemoryLevelRepository().seed(
      sortLevel,
      aLevel({ gameId: 'hexa-merge', levelId: 'sort-002' }),
    );
    const useCase = new GetLevelsUseCase(repository, VALIDATORS);

    // Act
    const result = await useCase.execute({ gameId: 'hexa-sort' });

    // Assert
    expect(repository.listCalls).toEqual(['hexa-sort']);
    expect(result).toEqual([sortLevel]);
  });

  it('should_return_an_empty_list_when_the_game_has_no_levels', async () => {
    // Arrange
    const useCase = new GetLevelsUseCase(
      new InMemoryLevelRepository(),
      VALIDATORS,
    );

    // Act
    const result = await useCase.execute({ gameId: 'hexa-sort' });

    // Assert
    expect(result).toEqual([]);
  });

  it.each<GameId>(['hexa-lines', 'hexa-merge'])(
    'should_throw_UnsupportedLevelGameError_when_the_game_is_%s',
    async (gameId) => {
      // Arrange
      const repository = new InMemoryLevelRepository();
      const useCase = new GetLevelsUseCase(repository, VALIDATORS);

      // Act
      const act = useCase.execute({ gameId });

      // Assert
      await expect(act).rejects.toThrow(UnsupportedLevelGameError);
      expect(repository.listCalls).toHaveLength(0);
    },
  );

  it('should_throw_when_a_validator_is_registered_under_another_game_id', () => {
    // Arrange
    const misregistered = new Map<GameId, ILevelSpecValidator>([
      ['hexa-merge', new SortLevelSpecValidator()],
    ]);

    // Act
    const act = () =>
      new GetLevelsUseCase(new InMemoryLevelRepository(), misregistered);

    // Assert
    expect(act).toThrow('wrong gameId');
  });
});
