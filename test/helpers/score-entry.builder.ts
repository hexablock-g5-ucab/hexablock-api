import {
  ScoreEntry,
  type ScoreEntryProps,
} from '../../src/domain/leaderboard/score-entry';

/** A game-wide hexa-sort entry; override only the fields a test cares about. */
export function aScoreEntry(
  overrides: Partial<ScoreEntryProps> = {},
): ScoreEntry {
  return new ScoreEntry({
    userId: 'player-1',
    gameId: 'hexa-sort',
    levelId: null,
    score: 1000,
    moves: 20,
    elapsedMs: 60_000,
    createdAt: new Date('2026-11-27T10:00:00.000Z'),
    ...overrides,
  });
}
