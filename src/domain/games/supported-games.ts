/** Game variants the API accepts as `gameId` (statement 3.6, scope amendment 2026-11-20). */
export const SUPPORTED_GAMES = [
  'hexa-lines',
  'hexa-sort',
  'hexa-merge',
] as const;

export type GameId = (typeof SUPPORTED_GAMES)[number];

export function isSupportedGame(value: unknown): value is GameId {
  return (
    typeof value === 'string' &&
    (SUPPORTED_GAMES as readonly string[]).includes(value)
  );
}
