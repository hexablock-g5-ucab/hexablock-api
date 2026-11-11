# UC-101 — Synchronise progress for one game

| Field | Value |
| --- | --- |
| Primary actor | Client app (on behalf of a logged-in player) |
| Goal | The server keeps the best known progress of the player for that gameId |
| Status | Draft |
| Linked requirements | FR-016, FR-020 |

## Preconditions
- The request carries a valid JWT.

## Main success scenario
1. Client sends `PUT /progress/{gameId}` with best score, stars per level and completed levels.
2. System validates the gameId and the body.
3. System merges with stored progress: best score = max, stars per level = max, completed = union.
4. System returns the merged progress.

## Alternative flows
- **A1 (step 2):** unknown gameId or invalid body → 400 problem+json, nothing stored.
- **A2 (precondition):** missing or expired JWT → 401 problem+json.

## Postconditions
- Success: stored progress is never lower than before for any field.
- Failure: stored progress unchanged.

## Business rules
- **BR-101-1:** merge is monotonic; offline play never loses progress.
