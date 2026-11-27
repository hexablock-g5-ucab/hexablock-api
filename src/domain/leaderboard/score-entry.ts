import type { GameId } from '../games/supported-games';

export interface ScoreEntryProps {
  userId: string;
  gameId: GameId;
  /** `null` for a game-wide entry; a level id for a level-based game. */
  levelId: string | null;
  score: number;
  moves: number;
  elapsedMs: number;
  createdAt: Date;
}

/**
 * One finished game submitted by a player (class model v6.3). Immutable: the
 * instance is frozen and `createdAt` is returned as a copy.
 */
export class ScoreEntry {
  readonly userId: string;
  readonly gameId: GameId;
  readonly levelId: string | null;
  readonly score: number;
  readonly moves: number;
  readonly elapsedMs: number;
  private readonly createdAtMs: number;

  constructor(props: ScoreEntryProps) {
    this.userId = props.userId;
    this.gameId = props.gameId;
    this.levelId = props.levelId;
    this.score = props.score;
    this.moves = props.moves;
    this.elapsedMs = props.elapsedMs;
    this.createdAtMs = props.createdAt.getTime();
    Object.freeze(this);
  }

  get createdAt(): Date {
    return new Date(this.createdAtMs);
  }
}
