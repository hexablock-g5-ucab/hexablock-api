import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  LEVEL_DIFFICULTIES,
  SUPPORTED_LEVEL_SCHEMA_VERSION,
} from '../../src/domain/levels/level-definition';
import { SortLevelSpecValidator } from '../../src/domain/levels/sort-level-spec.validator';

/**
 * Keeps schemas/level.schema.json and the domain rules in step. The repo holds
 * no example level files yet; when it does, validate each one here against the
 * schema and the gameId's ILevelSpecValidator.
 */
const schemaText = readFileSync(
  join(__dirname, '..', '..', 'schemas', 'level.schema.json'),
  'utf8',
);
const schema = JSON.parse(schemaText) as {
  properties: {
    schemaVersion: { const: number };
    gameId: { enum: string[] };
    levelId: { pattern: string };
    difficulty: { enum: string[] };
  };
};

describe('level.schema.json', () => {
  it('should_list_only_games_with_a_spec_validator_when_read', () => {
    // Arrange
    const levelGames = [new SortLevelSpecValidator().gameId];

    // Act
    const schemaGames = schema.properties.gameId.enum;

    // Assert
    expect(schemaGames).toEqual(levelGames);
  });

  it('should_match_the_domain_schema_version_and_difficulties_when_read', () => {
    // Arrange / Act
    const { schemaVersion, difficulty } = schema.properties;

    // Assert
    expect(schemaVersion.const).toBe(SUPPORTED_LEVEL_SCHEMA_VERSION);
    expect(difficulty.enum).toEqual([...LEVEL_DIFFICULTIES]);
  });

  it.each([
    ['sort-001', true],
    ['sort-123', true],
    ['fit-001', false],
    ['sort-01', false],
    ['sort-0001', false],
  ])(
    'should_match_level_id_%s_as_%s_when_checked_against_the_pattern',
    (levelId, expected) => {
      // Arrange
      const pattern = new RegExp(schema.properties.levelId.pattern);

      // Act
      const matches = pattern.test(levelId);

      // Assert
      expect(matches).toBe(expected);
    },
  );

  it('should_not_mention_retired_fields_when_read', () => {
    // Arrange / Act / Assert
    expect(schemaText).not.toMatch(/hexa-fit|stars|"goals"/);
  });
});
