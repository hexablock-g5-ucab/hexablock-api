import { frozenData } from './frozen-data';
import type { ProgressData } from './progress-merge-policy';

export interface LevelProgressProps {
  readonly levelId: string;
  readonly bestScore: number;
  /** When the level was first completed; null while it is not completed. */
  readonly completedAt: Date | null;
  readonly data: ProgressData;
}

/**
 * Immutable progress of a player on one level. It belongs to a GameProgress,
 * which carries the userId and gameId that scope it (class model v6.3).
 */
export class LevelProgress implements LevelProgressProps {
  readonly levelId: string;
  readonly bestScore: number;
  readonly data: ProgressData;
  private readonly completedAtMs: number | null;

  private constructor(props: LevelProgressProps) {
    this.levelId = props.levelId;
    this.bestScore = props.bestScore;
    this.completedAtMs = props.completedAt?.getTime() ?? null;
    this.data = frozenData(props.data);
    Object.freeze(this);
  }

  static create(props: LevelProgressProps): LevelProgress {
    return new LevelProgress(props);
  }

  /** A fresh copy on each read, because Date is mutable. */
  get completedAt(): Date | null {
    return this.completedAtMs === null ? null : new Date(this.completedAtMs);
  }

  get completed(): boolean {
    return this.completedAtMs !== null;
  }
}
