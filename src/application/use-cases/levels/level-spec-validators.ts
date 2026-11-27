import type { GameId } from '../../../domain/games/supported-games';
import type { ILevelSpecValidator } from '../../../domain/levels/level-spec-validator';
import { UnsupportedLevelGameError } from '../../errors/unsupported-level-game.error';

/** Registered spec validators, keyed by the gameId each one validates. */
export type LevelSpecValidators = ReadonlyMap<GameId, ILevelSpecValidator>;

/** Fails fast on a wiring mistake that would validate a game with another game's rules. */
export function assertValidatorsMatchKeys(
  validators: LevelSpecValidators,
): void {
  for (const [gameId, validator] of validators) {
    if (validator.gameId !== gameId) {
      throw new Error(
        'A level spec validator is registered under the wrong gameId.',
      );
    }
  }
}

/**
 * The validator of a level-based gameId.
 *
 * @throws UnsupportedLevelGameError when the gameId has no validator.
 */
export function validatorFor(
  validators: LevelSpecValidators,
  gameId: GameId,
): ILevelSpecValidator {
  const validator = validators.get(gameId);
  if (validator === undefined) {
    throw new UnsupportedLevelGameError();
  }
  return validator;
}
