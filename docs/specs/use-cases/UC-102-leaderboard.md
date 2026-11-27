# UC-102 — Submit a score and read the leaderboard of a game

| Field               | Value                                                                                                                      |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Primary actor       | Client app (submits on behalf of a logged-in player; anyone may read)                                                      |
| Goal                | Each player's best finished result for a gameId, or one of its levels, is visible in a ranking ordered by that game's rule |
| Status              | Approved                                                                                                                   |
| Linked requirements | FR-017, FR-020                                                                                                             |
| Entities            | ScoreEntry, RankedEntry, IRankingStrategy, BestScoreRanking (class model v6.3, `docs/diagrams/05-api.mmd`)                 |

## Preconditions

- Submit: the request carries a valid JWT. The player is the token subject, never a body field.
- Read: none (the leaderboard is public).

## Main success scenario

### Submit

1. Client sends `POST /games/{gameId}/scores` with `score`, `moves`, `elapsedMs` and an optional `levelId`.
2. System validates the gameId against `SUPPORTED_GAMES` and the body.
3. System creates a score entry for the token subject with `createdAt` set to the server clock and stores it.
4. System returns the stored entry.

### Read

1. Client sends `GET /games/{gameId}/leaderboard` with an optional `levelId`.
2. System validates the gameId and the query.
3. System loads the entries of that gameId: without `levelId`, only game-wide entries (`levelId` absent); with `levelId`, only the entries of that level.
4. System ranks the entries with the `IRankingStrategy` registered for the gameId, or `BestScoreRanking` when none is registered.
5. System returns at most the first `limit` ranked rows (default 50), best first.

## Alternative flows

- **A1 (submit step 2 / read step 2):** unknown gameId or invalid body or query → 400 problem+json; nothing is stored.
- **A2 (submit precondition):** missing or invalid JWT → 401 problem+json; nothing is stored.
- **A3 (read step 3):** no entries for that gameId and level → 200 with an empty list.

## Postconditions

- Success (submit): exactly one new entry exists for the token subject, gameId and levelId; no other entry changed.
- Success (read): nothing is stored or changed.
- Failure: stored entries unchanged.

## Business rules

- **BR-102-1:** every query filters by gameId (statement 3.6). Entries of another game never appear in a leaderboard.
- **BR-102-2:** game-wide entries (`levelId` absent) and level entries never mix. A level leaderboard contains only that level.
- **BR-102-3:** the ranking rule is chosen per gameId through `IRankingStrategy`. A variant that wins by fewer moves or less time registers its own strategy; `GetLeaderboardUseCase` does not change.
- **BR-102-4 (default `BestScoreRanking`):** one row per player holding their best entry. Order: higher `score`, then fewer `moves`, then less `elapsedMs`, then earlier `createdAt`. The same order picks each player's best entry.
- **BR-102-5:** `rank` starts at 1 and increases by one per row. Rows with equal keys never share a rank; they keep the order in which the repository returned them (stable sort).
- **BR-102-6:** submitting never changes another player's entries.
- **BR-102-7:** a player who resubmits an identical result still has one row in the default ranking, showing the earliest of the identical entries.
- **BR-102-8:** unfinished games are not stored; the client submits only finished games.

## Acceptance checks

- `BestScoreRanking` orders by each tie-break in turn, returns one row per player, keeps input order on a full tie and returns an empty list for no entries.
- Submit stores the entry with the clock time and the given player.
- The leaderboard filters by gameId and by levelId, never mixes game-wide and level entries, uses the registered strategy or the default, and applies the limit after ranking.
- HTTP checks (400, 401, empty list) are verified when the controller is wired.

## Open questions

- The contract's `ScoreEntryResponseDto` exposes an `id` (uuid) that the v6.3 `ScoreEntry` does not have. Decide whether the adapter returns the database id or the DTO drops it.
- `displayName` is added to `RankedEntry` by the adapter or the controller, not by the domain.
- `limit` is not yet part of `LeaderboardQueryDto`. Decide whether clients may set it and its maximum.
- Should a `levelId` be rejected for a game without levels (Lines, Merge) or for a level that is not published?
