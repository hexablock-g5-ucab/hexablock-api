import type { ProgressData } from './progress-merge-policy';

/** Deep copy of `data`, deeply frozen, so an entity never shares mutable state with its caller. */
export function frozenData(data: ProgressData): ProgressData {
  return deepFreeze(structuredClone(data));
}

function deepFreeze<T>(value: T): T {
  if (typeof value === 'object' && value !== null && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const child of Object.values(value)) {
      deepFreeze(child);
    }
  }
  return value;
}
