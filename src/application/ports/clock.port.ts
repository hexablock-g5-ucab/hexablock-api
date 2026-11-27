export const CLOCK = Symbol('Clock');

/** Server time, injected so use cases stay deterministic under test. */
export interface Clock {
  now(): Date;
}
