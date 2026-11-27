import { isIntegerAtLeast, isPlainObject } from './json-value';
import { InvalidLevelSpecError } from './level-errors';
import type { ILevelSpecValidator } from './level-spec-validator';

const GOAL_FORMS =
  'spec.goal must be exactly one of {type: "score", target} or {type: "colors", required}.';

/**
 * Validates the Hexa Sort `spec` (schemas/level.schema.json):
 * - `goal` is exactly one of `{type: "score", target: integer >= 1}` or
 *   `{type: "colors", required: {color: integer >= 1, ...}}` with at least one
 *   color, and no other properties;
 * - `colors` lists at least 2 strings;
 * - `seed` is an integer.
 *
 * Other top-level properties of `spec` are allowed, as in the JSON schema.
 */
export class SortLevelSpecValidator implements ILevelSpecValidator {
  readonly gameId = 'hexa-sort' as const;

  validate(spec: unknown): void {
    if (!isPlainObject(spec)) {
      throw new InvalidLevelSpecError('spec must be an object.');
    }
    validateGoal(spec.goal);
    if (
      !Array.isArray(spec.colors) ||
      spec.colors.length < 2 ||
      !spec.colors.every((color) => typeof color === 'string')
    ) {
      throw new InvalidLevelSpecError(
        'spec.colors must list at least 2 color names.',
      );
    }
    if (!Number.isInteger(spec.seed)) {
      throw new InvalidLevelSpecError('spec.seed must be an integer.');
    }
  }
}

function validateGoal(goal: unknown): void {
  if (goal === undefined) {
    throw new InvalidLevelSpecError('spec.goal is required.');
  }
  if (!isPlainObject(goal)) {
    throw new InvalidLevelSpecError(GOAL_FORMS);
  }
  switch (goal.type) {
    case 'score':
      assertOnlyKeys(goal, ['type', 'target']);
      if (!isIntegerAtLeast(goal.target, 1)) {
        throw new InvalidLevelSpecError(
          'spec.goal.target must be an integer of at least 1.',
        );
      }
      return;
    case 'colors':
      assertOnlyKeys(goal, ['type', 'required']);
      if (
        !isPlainObject(goal.required) ||
        Object.keys(goal.required).length === 0 ||
        !Object.values(goal.required).every((count) =>
          isIntegerAtLeast(count, 1),
        )
      ) {
        throw new InvalidLevelSpecError(
          'spec.goal.required must map at least one color to an integer of at least 1.',
        );
      }
      return;
    default:
      throw new InvalidLevelSpecError(GOAL_FORMS);
  }
}

/** Rejects a goal that mixes both forms or carries unknown properties. */
function assertOnlyKeys(
  goal: Record<string, unknown>,
  allowed: readonly string[],
): void {
  if (Object.keys(goal).some((key) => !allowed.includes(key))) {
    throw new InvalidLevelSpecError(GOAL_FORMS);
  }
}
