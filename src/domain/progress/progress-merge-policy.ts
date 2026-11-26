/** Game-specific progress data, stored as JSON. Its shape belongs to each game. */
export type ProgressData = Readonly<Record<string, unknown>>;

/**
 * Strategy that merges the game-specific `data` of a game's progress and of its
 * levels (class model v6.3). It is registered per gameId, so a new variant adds
 * its own policy without changing any use case. `bestScore` and completed levels
 * are always merged by `mergeMonotonic`, never by the policy.
 *
 * An implementation must be pure and idempotent: merging the same incoming data
 * twice must give the same result as merging it once.
 */
export interface IProgressMergePolicy {
  /** `incoming` is undefined when the client did not send data. */
  merge(stored: ProgressData, incoming: ProgressData | undefined): ProgressData;
}
