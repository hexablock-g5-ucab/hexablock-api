import { LoggingUseCase } from './logging.use-case';
import type { LogPort } from '../ports/log.port';

describe('LoggingUseCase', () => {
  it('should_record_only_metadata_when_operation_throws', async () => {
    const error = new Error('private token');
    const calls: unknown[][] = [];
    const logger: LogPort = {
      record: (...args) => {
        calls.push(args);
      },
    };
    const useCase = new LoggingUseCase(
      {
        execute: async () => {
          throw error;
        },
      },
      'login',
      logger,
    );

    await expect(useCase.execute('private password')).rejects.toBe(error);
    expect(calls).toEqual([
      ['login', 'started', 0],
      ['login', 'failed', expect.any(Number)],
    ]);
  });

  it('should_preserve_success_and_failure_when_logger_throws', async () => {
    const logger: LogPort = {
      record: () => {
        throw new Error('logger offline');
      },
    };
    const result = { ok: true };
    const failure = new Error('unavailable');

    await expect(
      new LoggingUseCase(
        { execute: async () => result },
        'read',
        logger,
      ).execute(null),
    ).resolves.toBe(result);
    await expect(
      new LoggingUseCase(
        {
          execute: async () => {
            throw failure;
          },
        },
        'read',
        logger,
      ).execute(null),
    ).rejects.toBe(failure);
  });
});
