import type { GameId } from '../games/supported-games';
import { frozenData } from './frozen-data';
import { LevelProgress, type LevelProgressProps } from './level-progress';
import type {
  IProgressMergePolicy,
  ProgressData,
} from './progress-merge-policy';

export interface GameProgressProps {
  readonly userId: string;
  readonly gameId: GameId;
  readonly bestScore: number;
  readonly data: ProgressData;
  readonly levels: readonly LevelProgressProps[];
}

/** Per-level progress sent by a client: absent fields mean "nothing new". */
export interface IncomingLevelProgress {
  readonly levelId: string;
  readonly bestScore: number;
  readonly completedAt?: Date | null;
  readonly data?: ProgressData;
}

/**
 * Progress sent by a client for one game. It carries no userId or gameId:
 * the merged result always keeps the owner and game of the stored progress.
 */
export interface IncomingProgress {
  readonly bestScore: number;
  readonly data?: ProgressData;
  readonly levels?: readonly IncomingLevelProgress[];
}

/** Immutable progress of one player in one game (class model v6.3). */
export class GameProgress {
  readonly userId: string;
  readonly gameId: GameId;
  readonly bestScore: number;
  readonly data: ProgressData;
  /** Sorted by levelId, one entry per level. */
  readonly levels: readonly LevelProgress[];

  private constructor(props: GameProgressProps) {
    this.userId = props.userId;
    this.gameId = props.gameId;
    this.bestScore = props.bestScore;
    this.data = frozenData(props.data);
    this.levels = Object.freeze(
      props.levels.map((level) => LevelProgress.create(level)).sort(byLevelId),
    );
    Object.freeze(this);
  }

  /** @throws Error when two levels share a levelId. */
  static create(props: GameProgressProps): GameProgress {
    const ids = new Set(props.levels.map((level) => level.levelId));
    if (ids.size !== props.levels.length) {
      throw new Error('GameProgress cannot contain the same levelId twice');
    }
    return new GameProgress(props);
  }

  /** Progress of a player who has not synchronised this game yet. */
  static empty(userId: string, gameId: GameId): GameProgress {
    return new GameProgress({
      userId,
      gameId,
      bestScore: 0,
      data: {},
      levels: [],
    });
  }

  mergeMonotonic(
    incoming: IncomingProgress,
    policy: IProgressMergePolicy,
  ): GameProgress {
    return mergeMonotonic(this, incoming, policy);
  }
}

/**
 * Pure monotonic merge (UC-101, BR-101-2). It never lowers a best score, never
 * uncompletes a level and is idempotent when the policy is idempotent:
 * - bestScore and per-level bestScore take the maximum;
 * - levels are the union; a level completed on both sides keeps the earliest
 *   completedAt;
 * - game and level data are merged by `policy`.
 * Repeated levelIds in `incoming` are merged one after another.
 */
export function mergeMonotonic(
  stored: GameProgress,
  incoming: IncomingProgress,
  policy: IProgressMergePolicy,
): GameProgress {
  const levels = new Map<string, LevelProgressProps>(
    stored.levels.map((level) => [level.levelId, level]),
  );
  for (const level of incoming.levels ?? []) {
    levels.set(
      level.levelId,
      mergeLevel(levels.get(level.levelId), level, policy),
    );
  }

  return GameProgress.create({
    userId: stored.userId,
    gameId: stored.gameId,
    bestScore: Math.max(stored.bestScore, incoming.bestScore),
    data: policy.merge(stored.data, incoming.data),
    levels: [...levels.values()],
  });
}

function mergeLevel(
  stored: LevelProgressProps | undefined,
  incoming: IncomingLevelProgress,
  policy: IProgressMergePolicy,
): LevelProgressProps {
  if (stored === undefined) {
    return {
      levelId: incoming.levelId,
      bestScore: incoming.bestScore,
      completedAt: incoming.completedAt ?? null,
      data: policy.merge({}, incoming.data),
    };
  }
  return {
    levelId: stored.levelId,
    bestScore: Math.max(stored.bestScore, incoming.bestScore),
    completedAt: earliest(stored.completedAt, incoming.completedAt ?? null),
    data: policy.merge(stored.data, incoming.data),
  };
}

function earliest(a: Date | null, b: Date | null): Date | null {
  if (a === null) return b;
  if (b === null) return a;
  return a.getTime() <= b.getTime() ? a : b;
}

function byLevelId(a: LevelProgress, b: LevelProgress): number {
  if (a.levelId === b.levelId) return 0;
  return a.levelId < b.levelId ? -1 : 1;
}
