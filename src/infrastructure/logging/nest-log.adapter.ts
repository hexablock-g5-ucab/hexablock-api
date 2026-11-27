import { Logger } from '@nestjs/common';
import type { LogOutcome, LogPort } from '../../application/ports/log.port';

export class NestLogAdapter implements LogPort {
  private readonly logger = new Logger('UseCase');

  record(operation: string, outcome: LogOutcome, durationMs: number): void {
    const message = `${operation} ${outcome} in ${durationMs} ms`;
    if (outcome === 'failed') {
      this.logger.error(message);
    } else {
      this.logger.log(message);
    }
  }
}
