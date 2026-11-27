import { assertValidBoard } from './board';
import { InvalidLevelBoardError } from './level-errors';

const SECRET = 'SECRET-ECHO-7f3a';

describe('assertValidBoard', () => {
  it.each<[string, unknown]>([
    ['a hexagon of radius 1', { shape: 'hexagon', radius: 1 }],
    ['a hexagon of radius 4', { shape: 'hexagon', radius: 4 }],
    ['a custom board of one cell', { shape: 'custom', cells: [[0, 0]] }],
    [
      'a custom board with negative coordinates',
      {
        shape: 'custom',
        cells: [
          [0, 0],
          [-1, 1],
          [1, -1],
        ],
      },
    ],
  ])('should_accept_the_board_when_it_is_%s', (_case, board) => {
    // Arrange: board from the table

    // Act
    const act = () => assertValidBoard(board);

    // Assert
    expect(act).not.toThrow();
  });

  it.each<[string, unknown, string]>([
    ['the board is null', null, 'board must be an object'],
    ['the board is a list', [[0, 0]], 'board must be an object'],
    ['the shape is missing', { radius: 3 }, 'board.shape'],
    ['the shape is unknown', { shape: 'square', radius: 3 }, 'board.shape'],
    ['the radius is missing', { shape: 'hexagon' }, 'board.radius'],
    ['the radius is zero', { shape: 'hexagon', radius: 0 }, 'board.radius'],
    [
      'the radius is not an integer',
      { shape: 'hexagon', radius: 2.5 },
      'board.radius',
    ],
    ['the cells are missing', { shape: 'custom' }, 'board.cells'],
    ['the cells are empty', { shape: 'custom', cells: [] }, 'board.cells'],
    [
      'a cell has one coordinate',
      { shape: 'custom', cells: [[0, 0], [1]] },
      'board.cells',
    ],
    [
      'a cell has three coordinates',
      { shape: 'custom', cells: [[0, 0, 0]] },
      'board.cells',
    ],
    [
      'a coordinate is not an integer',
      { shape: 'custom', cells: [[0, 0.5]] },
      'board.cells',
    ],
    [
      'a cell is an object',
      { shape: 'custom', cells: [{ q: 0, r: 0 }] },
      'board.cells',
    ],
  ])(
    'should_throw_InvalidLevelBoardError_when_%s',
    (_case, board, expectedMessage) => {
      // Arrange: board from the table

      // Act
      const act = () => assertValidBoard(board);

      // Assert
      expect(act).toThrow(InvalidLevelBoardError);
      expect(act).toThrow(expectedMessage);
    },
  );

  it.each<[string, unknown]>([
    ['the shape is a string', { shape: SECRET }],
    ['the radius is a string', { shape: 'hexagon', radius: SECRET }],
    ['a cell holds a string', { shape: 'custom', cells: [[SECRET, 0]] }],
  ])('should_not_echo_the_input_in_the_error_when_%s', (_case, board) => {
    // Arrange: board from the table

    // Act
    const act = () => assertValidBoard(board);

    // Assert
    expect(act).toThrow(InvalidLevelBoardError);
    expect(act).not.toThrow(SECRET);
  });
});
