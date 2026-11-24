# API class model v6.3

The model is frozen at v6.3.

- **Complete API model:** [Image](class-diagram-api.png) · [Zoomable SVG](class-diagram-api.svg) · [Editable source](class-diagram-api.mmd)
- **REST API view:** [Image](05-api.png) · [Editable source](05-api.mmd). It has the same content as the complete model, because the backend has always been a single view.
- **Clean Architecture:** [Image](clean-architecture.png) · [Editable source](clean-architecture.mmd)

The client model lives in [hexablock-app](https://github.com/hexablock-g5-ucab/hexablock-app/blob/develop/docs/diagrams/README.md).

## Reading the model

**Colours**
- Colours mark the Clean Architecture layer: red for Entities, yellow for Use cases, green for Interface adapters and blue for Nest wiring.
- An orange border marks an extension point. Each extension point is chosen per `gameId`, so a new game registers its own implementation and no existing use case changes.

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

## Regenerating

After editing the model, regenerate from this directory:

```sh
mmdc -i class-diagram-api.mmd -o class-diagram-api.svg -b white
mmdc -i class-diagram-api.mmd -o class-diagram-api.png -w 5700 -s 1.5 -b white
mmdc -i 05-api.mmd -o 05-api.png -w 2400 -s 2 -b white
```
