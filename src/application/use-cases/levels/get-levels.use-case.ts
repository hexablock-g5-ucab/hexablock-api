import type { GameId } from '../../../domain/games/supported-games';
import type { LevelDefinition } from '../../../domain/levels/level-definition';
import type { LevelRepository } from '../../ports/level-repository.port';
import type { UseCase } from '../use-case';
import {
  assertValidatorsMatchKeys,
  type LevelSpecValidators,
  validatorFor,
} from './level-spec-validators';

export interface GetLevelsInput {
  readonly gameId: GameId;
}

/** UC-103 read flow: the published levels of a game, ordered by order, then levelId. */
export class GetLevelsUseCase implements UseCase<
  GetLevelsInput,
  LevelDefinition[]
> {
  /** @param validators the same map UpsertLevelUseCase receives; it says which gameIds have levels. */
  constructor(
    private readonly repository: LevelRepository,
    private readonly validators: LevelSpecValidators,
  ) {
    assertValidatorsMatchKeys(validators);
  }

  async execute({ gameId }: GetLevelsInput): Promise<LevelDefinition[]> {
    validatorFor(this.validators, gameId);
    const levels = await this.repository.listByGame(gameId);
    return [...levels].sort(byOrderThenLevelId);
  }
}

/** Ties on `order` break by levelId in code-unit order, independent of locale. */
function byOrderThenLevelId(a: LevelDefinition, b: LevelDefinition): number {
  if (a.order !== b.order) {
    return a.order - b.order;
  }
  if (a.levelId === b.levelId) {
    return 0;
  }
  return a.levelId < b.levelId ? -1 : 1;
}
