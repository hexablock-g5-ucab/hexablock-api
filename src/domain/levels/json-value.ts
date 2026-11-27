/** True for a non-null object that is not an array, as parsed from JSON. */
export function isPlainObject(
  value: unknown,
): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** True for an integer number that is at least `minimum`. */
export function isIntegerAtLeast(value: unknown, minimum: number): boolean {
  return Number.isInteger(value) && (value as number) >= minimum;
}

/** Deep copy of a JSON value, deeply frozen, so an entity never shares mutable state with its caller. */
export function frozenCopy<T>(value: T): T {
  return deepFreeze(structuredClone(value));
}

/**
 * Structural equality of two JSON values. Object key order is ignored, because
 * a JSON column (Postgres jsonb) does not keep it; array order is significant.
 */
export function jsonEquals(a: unknown, b: unknown): boolean {
  if (Array.isArray(a) || Array.isArray(b)) {
    return (
      Array.isArray(a) &&
      Array.isArray(b) &&
      a.length === b.length &&
      a.every((item, index) => jsonEquals(item, b[index]))
    );
  }
  if (isPlainObject(a) && isPlainObject(b)) {
    const keys = Object.keys(a);
    return (
      keys.length === Object.keys(b).length &&
      keys.every((key) => Object.hasOwn(b, key) && jsonEquals(a[key], b[key]))
    );
  }
  return a === b;
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
