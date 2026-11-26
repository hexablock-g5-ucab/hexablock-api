import type { GameId } from '../../../domain/games/supported-games';
import { GameProgress } from '../../../domain/progress/game-progress';
import type { ProgressRepository } from '../../ports/progress-repository.port';
import type { UseCase } from '../use-case';

export interface ReadProgressInput {
  /** Subject of the verified token, never a request parameter. */
  readonly userId: string;
  readonly gameId: GameId;
}

/** UC-101 A3: the stored progress, or empty progress if nothing is stored. */
export class ReadProgressUseCase implements UseCase<
  ReadProgressInput,
  GameProgress
> {
  constructor(private readonly repository: ProgressRepository) {}

  async execute({ userId, gameId }: ReadProgressInput): Promise<GameProgress> {
    return (
      (await this.repository.find(userId, gameId)) ??
      GameProgress.empty(userId, gameId)
    );
  }
}
