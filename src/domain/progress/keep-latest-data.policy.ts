import type {
  IProgressMergePolicy,
  ProgressData,
} from './progress-merge-policy';

/**
 * Default merge policy: non-empty incoming data replaces stored data. Absent or
 * empty incoming data keeps the stored data, so a fresh install that syncs `{}`
 * before pulling never wipes the server's data.
 */
export class KeepLatestDataPolicy implements IProgressMergePolicy {
  merge(
    stored: ProgressData,
    incoming: ProgressData | undefined,
  ): ProgressData {
    if (incoming === undefined || Object.keys(incoming).length === 0) {
      return stored;
    }
    return incoming;
  }
}
