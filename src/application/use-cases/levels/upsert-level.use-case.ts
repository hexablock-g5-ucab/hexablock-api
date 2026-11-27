import type { GameId } from '../../../domain/games/supported-games';
import { assertValidBoard } from '../../../domain/levels/board';
import { isPlainObject } from '../../../domain/levels/json-value';
import { InvalidLevelSpecError } from '../../../domain/levels/level-errors';
import {
  LevelDefinition,
  type LevelContent,
  type LevelDifficulty,
  SUPPORTED_LEVEL_SCHEMA_VERSION,
} from '../../../domain/levels/level-definition';
import { UnsupportedSchemaVersionError } from '../../errors/unsupported-schema-version.error';
import type { LevelRepository } from '../../ports/level-repository.port';
import type { UseCase } from '../use-case';
import {
  assertValidatorsMatchKeys,
  type LevelSpecValidators,
  validatorFor,
} from './level-spec-validators';

/**
 * A level as the admin publishes it. gameId and levelId come from the path;
 * a `version` sent by the client is dropped before this point.
 */
export interface UpsertLevelInput {
  readonly gameId: GameId;
  readonly levelId: string;
  readonly schemaVersion: number;
  readonly order: number;
  /** Omitted means no difficulty; a republish without it clears a stored one. */
  readonly difficulty?: LevelDifficulty | null;
  readonly board: unknown;
  readonly spec: unknown;
}

/**
 * UC-103 publish flow: validates the level, then creates it with version 1 or
 * replaces it, raising the version only when its content changed.
 */
export class UpsertLevelUseCase implements UseCase<
  UpsertLevelInput,
  LevelDefinition
> {
  /** @param validators spec validator per gameId; a gameId without one has no levels. */
  constructor(
    private readonly repository: LevelRepository,
    private readonly validators: LevelSpecValidators,
  ) {
    assertValidatorsMatchKeys(validators);
  }

  async execute(input: UpsertLevelInput): Promise<LevelDefinition> {
    const { gameId, levelId } = input;
    const validator = validatorFor(this.validators, gameId);
    if (input.schemaVersion !== SUPPORTED_LEVEL_SCHEMA_VERSION) {
      throw new UnsupportedSchemaVersionError();
    }
    assertValidBoard(input.board);
    // Shared envelope rule, so the stored spec is an object whatever the validator checks.
    if (!isPlainObject(input.spec)) {
      throw new InvalidLevelSpecError('spec must be an object.');
    }
    validator.validate(input.spec);

    const content: LevelContent = {
      schemaVersion: input.schemaVersion,
      order: input.order,
      difficulty: input.difficulty ?? null,
      board: input.board,
      spec: input.spec,
    };
    const stored = await this.repository.find(gameId, levelId);
    const next =
      stored === null
        ? LevelDefinition.create({ ...content, gameId, levelId, version: 1 })
        : stored.revise(content);

    if (next !== stored) {
      await this.repository.save(next);
    }
    return next;
  }
}
