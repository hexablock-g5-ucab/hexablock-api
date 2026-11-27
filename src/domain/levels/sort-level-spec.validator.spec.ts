import { sortSpec } from '../../../test/helpers/level.builder';
import { InvalidLevelSpecError } from './level-errors';
import { SortLevelSpecValidator } from './sort-level-spec.validator';

const SECRET = 'SECRET-ECHO-7f3a';

describe('SortLevelSpecValidator', () => {
  const validator = new SortLevelSpecValidator();

  it('should_validate_hexa_sort_when_registered', () => {
    // Arrange / Act / Assert
    expect(validator.gameId).toBe('hexa-sort');
  });

  it('should_accept_the_spec_when_the_goal_is_a_score_target', () => {
    // Arrange
    const spec = sortSpec({ goal: { type: 'score', target: 1 } });

    // Act
    const act = () => validator.validate(spec);

    // Assert
    expect(act).not.toThrow();
  });

  it('should_accept_the_spec_when_the_goal_requires_colors', () => {
    // Arrange
    const spec = sortSpec({
      goal: { type: 'colors', required: { red: 3, blue: 1 } },
    });

    // Act
    const act = () => validator.validate(spec);

    // Assert
    expect(act).not.toThrow();
  });

  it('should_accept_the_spec_when_it_has_other_top_level_properties', () => {
    // Arrange
    const spec = sortSpec({ hint: 'stack by color' });

    // Act
    const act = () => validator.validate(spec);

    // Assert
    expect(act).not.toThrow();
  });

  it('should_accept_the_spec_when_the_seed_is_negative', () => {
    // Arrange
    const spec = sortSpec({ seed: -7 });

    // Act
    const act = () => validator.validate(spec);

    // Assert
    expect(act).not.toThrow();
  });

  it.each<[string, unknown, string]>([
    ['the spec is not an object', ['goal'], 'spec must be an object'],
    ['the spec is null', null, 'spec must be an object'],
    [
      'the goal is missing',
      { colors: ['red', 'blue'], seed: 1 },
      'spec.goal is required',
    ],
    [
      'the goal mixes both forms',
      sortSpec({ goal: { type: 'score', target: 5, required: { red: 1 } } }),
      'exactly one of',
    ],
    [
      'the colors goal also has a target',
      sortSpec({ goal: { type: 'colors', required: { red: 1 }, target: 5 } }),
      'exactly one of',
    ],
    [
      'both goal forms are sent as a list',
      sortSpec({
        goal: [
          { type: 'score', target: 5 },
          { type: 'colors', required: { red: 1 } },
        ],
      }),
      'exactly one of',
    ],
    [
      'the goal has no type',
      sortSpec({ goal: { target: 5 } }),
      'exactly one of',
    ],
    [
      'the goal type is unknown',
      sortSpec({ goal: { type: 'moves', target: 5 } }),
      'exactly one of',
    ],
    [
      'the score goal has an extra property',
      sortSpec({ goal: { type: 'score', target: 5, bonus: 1 } }),
      'exactly one of',
    ],
    [
      'the target is missing',
      sortSpec({ goal: { type: 'score' } }),
      'spec.goal.target',
    ],
    [
      'the target is zero',
      sortSpec({ goal: { type: 'score', target: 0 } }),
      'spec.goal.target',
    ],
    [
      'the target is not an integer',
      sortSpec({ goal: { type: 'score', target: 2.5 } }),
      'spec.goal.target',
    ],
    [
      'the target is a numeric string',
      sortSpec({ goal: { type: 'score', target: '500' } }),
      'spec.goal.target',
    ],
    [
      'the required colors are empty',
      sortSpec({ goal: { type: 'colors', required: {} } }),
      'spec.goal.required',
    ],
    [
      'the required colors are a list',
      sortSpec({ goal: { type: 'colors', required: ['red'] } }),
      'spec.goal.required',
    ],
    [
      'a required count is zero',
      sortSpec({ goal: { type: 'colors', required: { red: 2, blue: 0 } } }),
      'spec.goal.required',
    ],
    [
      'a required count is not an integer',
      sortSpec({ goal: { type: 'colors', required: { red: 1.5 } } }),
      'spec.goal.required',
    ],
    [
      'the colors are missing',
      { goal: { type: 'score', target: 5 }, seed: 1 },
      'spec.colors',
    ],
    ['there is only one color', sortSpec({ colors: ['red'] }), 'spec.colors'],
    [
      'a color is not a string',
      sortSpec({ colors: ['red', 3] }),
      'spec.colors',
    ],
    [
      'the seed is missing',
      { goal: { type: 'score', target: 5 }, colors: ['red', 'blue'] },
      'spec.seed',
    ],
    ['the seed is not an integer', sortSpec({ seed: 4.2 }), 'spec.seed'],
    ['the seed is a numeric string', sortSpec({ seed: '42' }), 'spec.seed'],
  ])(
    'should_throw_InvalidLevelSpecError_when_%s',
    (_case, spec, expectedMessage) => {
      // Arrange: spec from the table

      // Act
      const act = () => validator.validate(spec);

      // Assert
      expect(act).toThrow(InvalidLevelSpecError);
      expect(act).toThrow(expectedMessage);
    },
  );

  it.each<[string, unknown]>([
    ['the spec is a string', SECRET],
    ['the goal type is unknown', sortSpec({ goal: { type: SECRET } })],
    [
      'the goal has an extra property',
      sortSpec({ goal: { type: 'score', target: 5, [SECRET]: SECRET } }),
    ],
    [
      'the target is a string',
      sortSpec({ goal: { type: 'score', target: SECRET } }),
    ],
    [
      'a required count is a string',
      sortSpec({ goal: { type: 'colors', required: { [SECRET]: SECRET } } }),
    ],
    ['the colors hold one name', sortSpec({ colors: [SECRET] })],
    ['the seed is a string', sortSpec({ seed: SECRET })],
  ])('should_not_echo_the_input_in_the_error_when_%s', (_case, spec) => {
    // Arrange: spec from the table

    // Act
    let error: unknown;
    try {
      validator.validate(spec);
    } catch (caught) {
      error = caught;
    }

    // Assert
    expect(error).toBeInstanceOf(InvalidLevelSpecError);
    expect((error as Error).message).not.toContain(SECRET);
  });
});
