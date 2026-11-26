import type { GameId } from '../../../domain/games/supported-games';
import {
  GameProgress,
  type IncomingProgress,
} from '../../../domain/progress/game-progress';
import { KeepLatestDataPolicy } from '../../../domain/progress/keep-latest-data.policy';
import type { IProgressMergePolicy } from '../../../domain/progress/progress-merge-policy';
import type { ProgressRepository } from '../../ports/progress-repository.port';
import type { UseCase } from '../use-case';

export interface SyncProgressInput extends IncomingProgress {
  /** Subject of the verified token, never a field of the request body. */
  readonly userId: string;
  readonly gameId: GameId;
}

/** UC-101 main flow: merge the incoming progress into the stored progress. */
export class SyncProgressUseCase implements UseCase<
  SyncProgressInput,
  GameProgress
> {
  private readonly defaultPolicy: IProgressMergePolicy =
    new KeepLatestDataPolicy();

  /** @param policies merge policy per gameId; a gameId without one uses KeepLatestDataPolicy. */
  constructor(
    private readonly repository: ProgressRepository,
    private readonly policies: ReadonlyMap<GameId, IProgressMergePolicy>,
  ) {}

  async execute(input: SyncProgressInput): Promise<GameProgress> {
    const { userId, gameId, ...incoming } = input;
    const stored =
      (await this.repository.find(userId, gameId)) ??
      GameProgress.empty(userId, gameId);
    const policy = this.policies.get(gameId) ?? this.defaultPolicy;

    const merged = stored.mergeMonotonic(incoming, policy);
    await this.repository.save(merged);
    return merged;
  }
}
