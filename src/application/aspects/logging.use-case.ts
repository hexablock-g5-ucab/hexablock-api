import { Logger } from '@nestjs/common';
import type { UseCase } from '../use-cases/use-case';

/** AOP aspect without libraries: logs entry, exit and duration of any use case. */
export class LoggingUseCase<I, O> implements UseCase<I, O> {
  private readonly logger: Logger;

  constructor(
    private readonly inner: UseCase<I, O>,
    private readonly name: string,
  ) {
    this.logger = new Logger(name);
  }

  async execute(input: I): Promise<O> {
    const started = Date.now();
    this.logger.log(`-> ${this.name}`);
    try {
      const output = await this.inner.execute(input);
      this.logger.log(`<- ${this.name} ${Date.now() - started} ms`);
      return output;
    } catch (error) {
      this.logger.error(`x ${this.name}`, error as Error);
      throw error;
    }
  }
}
