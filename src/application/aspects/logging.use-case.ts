import type { LogOutcome, LogPort } from '../ports/log.port';
import type { UseCase } from '../use-cases/use-case';

/** Supply a fixed operation name independent of player data. */
export class LoggingUseCase<I, O> implements UseCase<I, O> {
  constructor(
    private readonly inner: UseCase<I, O>,
    private readonly name: string,
    private readonly logger: LogPort,
  ) {}

  async execute(input: I): Promise<O> {
    const started = performance.now();
    this.record('started', 0);
    try {
      const output = await this.inner.execute(input);
      this.record('succeeded', performance.now() - started);
      return output;
    } catch (error) {
      this.record('failed', performance.now() - started);
      throw error;
    }
  }

  private record(outcome: LogOutcome, elapsed: number): void {
    try {
      this.logger.record(this.name, outcome, Math.round(elapsed));
    } catch {
      // Diagnostics must preserve the original operation outcome.
    }
  }
}
