# UC-101 — Synchronise progress for one game

| Field | Value |
| --- | --- |
| Primary actor | Client app (on behalf of a logged-in player) |
| Goal | The server keeps the best known progress of the player for that gameId |
| Status | Approved |
| Linked requirements | FR-016, FR-020 |
| Entities | GameProgress, LevelProgress, IProgressMergePolicy (class model v6.3) |

## Preconditions

- The request carries a valid JWT. The player is the token's subject, never a field of the body.

## Main success scenario

1. Client sends `PUT /progress/{gameId}` with `bestScore`, optional game-specific `data` and optional per-level progress `levels` (each with `levelId`, `bestScore`, optional `completedAt` and optional `data`).
2. System validates the gameId and the body.
3. System loads the stored progress of the authenticated player for that gameId, or empty progress if none is stored.
4. System merges the incoming progress into the stored progress (BR-101-2) and stores the result.
5. System returns the merged progress.

## Alternative flows

- **A1 (step 2):** unknown gameId or invalid body → 400 problem+json, nothing stored.
- **A2 (precondition):** missing or expired JWT → 401 problem+json.
- **A3 (read):** client sends `GET /progress/{gameId}` → system returns the stored progress of the authenticated player for that gameId. If nothing is stored yet, it returns empty progress: `bestScore` 0, `data` `{}` and `levels` `[]`.

## Postconditions

- Success: stored progress is never lower than before for any field, and no completed level becomes uncompleted.
- Failure: stored progress unchanged.

## Business rules

- **BR-101-1:** merge is monotonic; offline play never loses progress.
- **BR-101-2:** merge rules:
  - `bestScore` = max(stored, incoming);
  - per-level `bestScore` = max(stored, incoming);
  - completed levels = union of stored and incoming; a level completed on both sides keeps the earliest `completedAt`;
  - game `data` and level `data` are merged by the `IProgressMergePolicy` registered for the gameId. The default is `KeepLatestDataPolicy`: non-empty incoming data replaces stored data, and absent or empty (`{}`) incoming data keeps the stored data, so a fresh install that syncs `{}` before pulling never wipes the server's data.
- **BR-101-3:** synchronising the same progress twice gives the same stored result (idempotent).
- **BR-101-4:** progress is always scoped to the authenticated player and the gameId. Data of another player or another game is never read, changed or returned (statement 3.6).

## Open questions

- Concurrent syncs of the same player and game must not lose progress. The persistence adapter enforces this; its PR tests it. The adapter PR may change the port from separate `find` and `save` to a single transactional update, so that policy-merged `data` is also safe.
