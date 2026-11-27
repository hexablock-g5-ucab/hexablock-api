import type { Clock } from '../../src/application/ports/clock.port';

/** Test clock that always returns the same instant. */
export class FixedClock implements Clock {
  constructor(private readonly instant: Date) {}

  now(): Date {
    return new Date(this.instant.getTime());
  }
}
