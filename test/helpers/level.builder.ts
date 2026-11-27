import {
  LevelDefinition,
  type LevelDefinitionProps,
} from '../../src/domain/levels/level-definition';

/** A valid Hexa Sort spec with a score goal. */
export function sortSpec(
  overrides: Record<string, unknown> = {},
): Record<string, unknown> {
  return {
    goal: { type: 'score', target: 500 },
    colors: ['red', 'blue'],
    seed: 42,
    ...overrides,
  };
}

/** A valid stored Hexa Sort level; override any field. */
export function aLevel(
  overrides: Partial<LevelDefinitionProps> = {},
): LevelDefinition {
  return LevelDefinition.create({
    gameId: 'hexa-sort',
    levelId: 'sort-001',
    schemaVersion: 1,
    version: 1,
    order: 1,
    difficulty: 'easy',
    board: { shape: 'hexagon', radius: 3 },
    spec: sortSpec(),
    ...overrides,
  });
}
