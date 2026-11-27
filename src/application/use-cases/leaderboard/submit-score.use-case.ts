import type { GameId } from '../../../domain/games/supported-games';
import { ScoreEntry } from '../../../domain/leaderboard/score-entry';
import type { Clock } from '../../ports/clock.port';
import type { ScoreRepository } from '../../ports/score-repository.port';
import type { UseCase } from '../use-case';

export interface SubmitScoreInput {
  /** Token subject; never taken from the request body. */
  userId: string;
  gameId: GameId;
  levelId?: string;
  score: number;
  moves: number;
  elapsedMs: number;
}

/** UC-102 submit: stores one finished game for the authenticated player. */
export class SubmitScoreUseCase implements UseCase<
  SubmitScoreInput,
  ScoreEntry
> {
  constructor(
    private readonly scores: ScoreRepository,
    private readonly clock: Clock,
  ) {}

  async execute(input: SubmitScoreInput): Promise<ScoreEntry> {
    const entry = new ScoreEntry({
      userId: input.userId,
      gameId: input.gameId,
      levelId: input.levelId ?? null,
      score: input.score,
      moves: input.moves,
      elapsedMs: input.elapsedMs,
      createdAt: this.clock.now(),
    });
    await this.scores.add(entry);
    return entry;
  }
}
