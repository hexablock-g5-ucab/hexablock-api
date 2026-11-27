import { isIntegerAtLeast, isPlainObject } from './json-value';
import { InvalidLevelBoardError } from './level-errors';

/** Axial hex coordinate `[q, r]`. */
export type HexCell = readonly [number, number];

/** Board of a level (schemas/level.schema.json `board`). */
export type BoardSpec =
  | { readonly shape: 'hexagon'; readonly radius: number }
  | { readonly shape: 'custom'; readonly cells: readonly HexCell[] };

/**
 * Checks the board rules shared by every level-based variant: a hexagon with an
 * integer radius of at least 1, or a custom non-empty list of integer `[q, r]`
 * pairs. Other properties are allowed, as in the JSON schema.
 *
 * @throws InvalidLevelBoardError naming the field, never echoing the input.
 */
export function assertValidBoard(board: unknown): asserts board is BoardSpec {
  if (!isPlainObject(board)) {
    throw new InvalidLevelBoardError('board must be an object.');
  }
  switch (board.shape) {
    case 'hexagon':
      if (!isIntegerAtLeast(board.radius, 1)) {
        throw new InvalidLevelBoardError(
          'board.radius must be an integer of at least 1.',
        );
      }
      return;
    case 'custom':
      if (
        !Array.isArray(board.cells) ||
        board.cells.length === 0 ||
        !board.cells.every(isHexCell)
      ) {
        throw new InvalidLevelBoardError(
          'board.cells must be a non-empty list of [q, r] integer pairs.',
        );
      }
      return;
    default:
      throw new InvalidLevelBoardError(
        'board.shape must be "hexagon" or "custom".',
      );
  }
}

function isHexCell(cell: unknown): boolean {
  return (
    Array.isArray(cell) && cell.length === 2 && cell.every(Number.isInteger)
  );
}
