/**
 * The spec section of a level is invalid for its gameId. The message names
 * the offending field path only: it never echoes a value or key from the input.
 */
export class InvalidLevelSpecError extends Error {
  override name = 'InvalidLevelSpecError';
}

/**
 * The board of a level is invalid. The message names the offending field path
 * only: it never echoes a value or key from the input.
 */
export class InvalidLevelBoardError extends Error {
  override name = 'InvalidLevelBoardError';
}
