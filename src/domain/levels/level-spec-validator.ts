import type { GameId } from '../games/supported-games';

/**
 * Strategy that validates the `spec` section of a level for one gameId
 * (class model v6.3, extension point). A gameId accepts levels only when a
 * validator is registered for it, so a new level-based variant adds its own
 * implementation and no use case changes.
 */
export interface ILevelSpecValidator {
  readonly gameId: GameId;

  /**
   * Returns when `spec` is valid for {@link gameId}.
   *
   * @throws InvalidLevelSpecError naming the field, never echoing the input.
   */
  validate(spec: unknown): void;
}
