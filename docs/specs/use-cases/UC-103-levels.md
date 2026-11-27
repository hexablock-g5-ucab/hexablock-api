# UC-103 — Read and publish level definitions

| Field               | Value                                                                                                                                                          |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Primary actor       | Admin (publish); any client app (read)                                                                                                                         |
| Goal                | Clients load the published levels of a level-based game in their intended order, and an admin can publish or update a level without breaking the shared format |
| Status              | Approved                                                                                                                                                       |
| Linked requirements | FR-018, FR-020                                                                                                                                                 |
| Entities            | LevelDefinition, ILevelSpecValidator, SortLevelSpecValidator, LevelRepository                                                                                  |

## Preconditions

- Read: none. `GET /games/{gameId}/levels` is public.
- Publish: the request carries a valid JWT of a user with the admin role. `AdminGuard` enforces this after `JwtAuthGuard` (wired in the controller PR).

## Main success scenario — read

1. Client sends `GET /games/{gameId}/levels`.
2. System checks that the gameId accepts levels (BR-103-1).
3. System returns the published levels of that gameId, ordered by `order`, then by `levelId` (BR-103-6).

## Main success scenario — publish

1. Admin sends `PUT /games/{gameId}/levels/{levelId}` with `schemaVersion`, `order`, optional `difficulty`, `board` and `spec`. The body may repeat `gameId` and `levelId`; it may also carry `version`, which is ignored.
2. System checks that `gameId` and `levelId` in the body, if present, match the path.
3. System checks that the gameId accepts levels (BR-103-1), that `schemaVersion` is 1 (BR-103-3), that the board is valid (BR-103-4) and that the spec is valid for the gameId (BR-103-2).
4. System stores the level with its board and spec in one operation (BR-103-5), with the version given by BR-103-7.
5. System returns the stored level, including its `version`.

## Alternative flows

- **A1 (read step 2, publish step 3):** the gameId is unknown or has no registered `ILevelSpecValidator` → 400 problem+json, nothing stored.
- **A2 (publish steps 2–3):** the body is invalid (envelope ids differ from the path, `schemaVersion` is not 1, bad board) or the spec breaks the gameId's rules → 400 problem+json, nothing stored. The detail names the field and never echoes the input.
- **A3 (publish precondition):** missing or expired JWT → 401 problem+json.
- **A4 (publish precondition):** the authenticated user is not an admin → 403 problem+json.
- **A5 (read step 3):** the game has no published levels → 200 with an empty list.
- **A6 (publish step 4):** the level already exists with identical content → nothing is written; 200 with the stored level and its unchanged version.

## Postconditions

- Success (publish): exactly one level is stored under `(gameId, levelId)`, with its board and spec together, and its version follows BR-103-7.
- Failure: stored levels unchanged.

## Business rules

- **BR-103-1:** only a gameId with a registered `ILevelSpecValidator` accepts levels. Today that is `hexa-sort` (`SortLevelSpecValidator`). `hexa-lines` and `hexa-merge` are rejected on read and on publish.
- **BR-103-2:** the spec is validated by the gameId's validator. For Hexa Sort, `goal` is exactly one of `{type: "score", target: integer >= 1}` or `{type: "colors", required: {color: integer >= 1, ...}}` with at least one color and no other properties; `colors` lists at least 2 strings; `seed` is an integer. A level without a goal, or with both forms, is rejected.
- **BR-103-3:** `schemaVersion` (the wire format) must be 1. It is separate from `version` (the content revision).
- **BR-103-4:** the board is either `{shape: "hexagon", radius: integer >= 1}` or `{shape: "custom", cells: [[q, r], ...]}` with at least one integer pair.
- **BR-103-5:** board and spec are stored together, in one operation, under `(gameId, levelId)`.
- **BR-103-6:** listing order is `order` ascending, then `levelId` ascending (code-unit order). Two levels may share an `order`.
- **BR-103-7:** `version` is managed by the server: 1 when the level is created; on a republish it goes up by 1 only when the content (`schemaVersion`, `order`, `difficulty`, `board`, `spec`) changed, and is unchanged otherwise, so republishing is idempotent. Object key order in `board` and `spec` does not count as a change; array order does. An omitted `difficulty` means none, so a republish without it clears a stored difficulty.
- **BR-103-8:** every query filters by gameId (statement 3.6): a level of another game is never read or overwritten, even when it has the same `levelId`.
- **BR-103-9:** the full envelope (`gameId`, `levelId`, `schemaVersion`, `version`, `order`, `difficulty`, `board`, `spec`) survives a publish/read round trip, so a level read back can be sent unchanged.

The shared format is `schemas/level.schema.json`.

## Open questions

- `levelId` format: the schema requires `^sort-[0-9]{3}$`, but no layer checks it yet. Decide whether the controller PR validates it with a pipe or the validator owns a per-game pattern (a model change).
- Should a colors goal only require colors listed in `colors`, and should `colors` be unique? Neither the schema nor the model says so.
- Should `board.radius` and the number of `board.cells` have an upper bound?
- Concurrent publishes of the same level can both write the same next version. Publishing is admin-only; the adapter PR decides whether to guard it.
- The contract e2e bodies (`test/api-contract.e2e-spec.ts`) use a spec without `colors` and `seed`. They pass today because the handlers answer 501, and must be updated when the controller is wired.
