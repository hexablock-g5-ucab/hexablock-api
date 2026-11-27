import type { GameId } from '../games/supported-games';
import { assertValidBoard, type BoardSpec } from './board';
import { frozenCopy, jsonEquals } from './json-value';

export const LEVEL_DIFFICULTIES = ['easy', 'medium', 'hard'] as const;

export type LevelDifficulty = (typeof LEVEL_DIFFICULTIES)[number];

/** The only wire format version (`schemaVersion`) the API accepts. */
export const SUPPORTED_LEVEL_SCHEMA_VERSION = 1;

/** Game-specific section of a level, validated by the gameId's ILevelSpecValidator. */
export type LevelSpec = { readonly [key: string]: unknown };

/** What an admin publishes; `version` is decided by the server. */
export interface LevelContent {
  readonly schemaVersion: number;
  readonly order: number;
  readonly difficulty: LevelDifficulty | null;
  readonly board: BoardSpec;
  readonly spec: LevelSpec;
}

export interface LevelDefinitionProps extends LevelContent {
  readonly gameId: GameId;
  readonly levelId: string;
  /** Content revision, managed by the server; separate from `schemaVersion`. */
  readonly version: number;
}

/**
 * Immutable level definition, stored under `(gameId, levelId)` with its board
 * and spec together (class model v6.3). Board and spec are deep copies, deeply
 * frozen, so the entity never shares mutable state with its caller.
 */
export class LevelDefinition implements LevelDefinitionProps {
  readonly gameId: GameId;
  readonly levelId: string;
  readonly schemaVersion: number;
  readonly version: number;
  readonly order: number;
  readonly difficulty: LevelDifficulty | null;
  readonly board: BoardSpec;
  readonly spec: LevelSpec;

  private constructor(props: LevelDefinitionProps) {
    this.gameId = props.gameId;
    this.levelId = props.levelId;
    this.schemaVersion = props.schemaVersion;
    this.version = props.version;
    this.order = props.order;
    this.difficulty = props.difficulty;
    this.board = frozenCopy(props.board);
    this.spec = frozenCopy(props.spec);
    Object.freeze(this);
  }

  /** @throws InvalidLevelBoardError when the board breaks the shared board rules. */
  static create(props: LevelDefinitionProps): LevelDefinition {
    assertValidBoard(props.board);
    return new LevelDefinition(props);
  }

  /**
   * The level after publishing `content` over `this` stored revision. The
   * version goes up by one only when the content changed; an identical
   * republish returns `this` unchanged.
   */
  revise(content: LevelContent): LevelDefinition {
    if (this.hasSameContent(content)) {
      return this;
    }
    return LevelDefinition.create({
      ...content,
      gameId: this.gameId,
      levelId: this.levelId,
      version: this.version + 1,
    });
  }

  /** Compares schemaVersion, order, difficulty, board and spec; ignores ids and version. */
  hasSameContent(content: LevelContent): boolean {
    return (
      this.schemaVersion === content.schemaVersion &&
      this.order === content.order &&
      this.difficulty === content.difficulty &&
      jsonEquals(this.board, content.board) &&
      jsonEquals(this.spec, content.spec)
    );
  }
}
