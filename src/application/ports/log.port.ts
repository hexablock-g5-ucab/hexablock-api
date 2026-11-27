export type LogOutcome = 'started' | 'succeeded' | 'failed';

export interface LogPort {
  record(operation: string, outcome: LogOutcome, durationMs: number): void;
}
