/** The gameId has no registered ILevelSpecValidator, so it has no levels (UC-103). */
export class UnsupportedLevelGameError extends Error {
  override name = 'UnsupportedLevelGameError';

  constructor() {
    super('This game does not support level definitions.');
  }
}
