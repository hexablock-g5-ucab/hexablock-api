# API class model

The four-layer design covers 47 classes and 70 relationships. Yellow identifies domain classes, purple application, green interfaces and blue infrastructure.

[Interactive HTML](class-diagram-api.html) · [Vector PDF](class-diagram-api.pdf)

Download the HTML from GitHub and open it locally to search classes, inspect members and follow relationships. The first PDF page contains the whole model; the following pages index relationships by source class.

[Companion app model](https://github.com/hexablock-g5-ucab/hexablock-app/blob/develop/docs/diagrams/README.md)

## Design contracts

**Identity and authorization**
- The user ID comes from the verified identity, never from the request body.
- `JwtAuthGuard` protects the progress routes, `POST /games/:gameId/scores` and `GET /me`.
- `AdminGuard` runs after `JwtAuthGuard` and restricts level publication to users with the admin role.

**Progress**
- Progress is isolated by user and game.
- Sync keeps the highest score per game and per level, and the union of completed levels, even with concurrent or repeated syncs.
- Each game's own data travels as JSON (`data`). `IProgressMergePolicy` merges it for each `gameId`, with `KeepLatestDataPolicy` as the default.
- There are no stars: Sort progress is the set of completed levels.

**Scores and rankings**
- `ScoreEntry` carries `score`, `moves` and `elapsedMs`.
- `GetLeaderboardUseCase` picks an `IRankingStrategy` for each `gameId` and falls back to `BestScoreRanking`. A game won by fewer moves or less time registers its own strategy.

**Levels**
- The envelope is validated first, and then the spec is dispatched by game ID through `ILevelSpecValidator`.
- Board and spec are stored together under (gameId, levelId), and the initial migration must include board storage.
- The wire `order` maps to Prisma `sortOrder`. The wire `schemaVersion` is separate from the content revision.
- **Round-trip acceptance case:**
  1. publish a Sort level with a non-default radius;
  2. restart the API;
  3. fetch the level and compare its board, goals, colours and seed.

  The mobile client must build the same board.

**Validation and logging**
- Game IDs are validated on the progress, score and ranking routes. Level routes also require a registered level-based variant.
- `LoggingUseCase` wraps a use case and receives a logger port. Inputs with credentials or personal data stay out of the logs.
