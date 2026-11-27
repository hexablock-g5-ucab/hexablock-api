# Working on the HexaBlock REST API

## Start here

Read the [assessed scope](docs/specs/requirements.md), the relevant use case under `docs/specs/use-cases/` and the [layered class model](docs/diagrams/README.md). The model is frozen: changes are proposed in a PR, not made silently. The team confirmed the professor removed Hexa Fit. Deliver Lines, Sort and Merge. Treat the model as the design baseline and the implementation and tests as evidence of current behaviour.

## Architecture

- Keep entities and policies independent of Nest and Prisma. Application use cases depend on ports. HTTP controllers and persistence adapters translate data. Nest modules wire concrete dependencies.
- Folders follow the layers:
  - `src/domain` holds entities and policies;
  - `src/application` holds use cases, ports and aspects;
  - `src/infrastructure` holds the Prisma and security adapters;
  - `src/interfaces/http/<feature>` holds controllers, DTOs and filters;
  - `src/modules` holds the Nest wiring.
- Only `src/infrastructure/prisma` imports `@prisma/client`. Ports are injected through tokens, never by concrete class.
- Derive the player from authentication, never from the request body. Scope progress to player and game, and level progress to player, game and level. Every query filters by `gameId` (statement 3.6): data of another game must never appear. Verify that a repeated sync and concurrent updates preserve the best result.
- Valid game IDs come from `SUPPORTED_GAMES` (`hexa-lines`, `hexa-sort`, `hexa-merge`) and are checked by `GameIdPipe`.
- Extension points are chosen per `gameId`, so a new variant registers its own implementation and no existing use case changes:
  - `IProgressMergePolicy` merges each game's own progress `data`. The default is `KeepLatestDataPolicy`.
  - `IRankingStrategy` orders the leaderboard. The default is `BestScoreRanking`; another variant may rank by fewer moves or less time.
  - `ILevelSpecValidator` validates each game's level `spec`.
- Data model (v6.3):
  - **Game progress:** `bestScore` and `data` (JSON).
  - **Level progress:** `bestScore`, `completedAt` and `data` (JSON). There are no stars.
  - **Scores:** `score`, `moves` and `elapsedMs`.
  - **Levels:** `board` and `spec` are stored together under `(gameId, levelId)`. `schemaVersion` (wire format) is separate from `version` (content revision). The wire `order` maps to `sortOrder`, and `difficulty` is optional.
  - **Unfinished games are not stored.**
- Authorization:
  - `JwtAuthGuard` protects the progress routes, `POST /games/:gameId/scores` and `GET /me`.
  - `AdminGuard` runs after `JwtAuthGuard` and restricts level publication to the admin role.
- Preserve the complete level envelope on a publish/read round trip. Sort is the only assessed level-based game.
- Return errors as `application/problem+json` (RFC 9457) from a global exception filter, with `type`, `title`, `status`, `detail` and `instance`. Never expose stack traces, request bodies or internal identifiers in an error.
- Wrap use cases for logging. Inject a logger port when wiring the existing decorator; keep credentials and personal data out of logs. Never read or publish local secrets.
- Every Prisma schema change ships with its migration in the same PR. Never edit an applied migration or use `prisma db push` for shared work. Without a running database, generate a migration with `prisma migrate diff`.

## Working agreement

1. Start behaviour changes from an approved use case. Name the acceptance checks and unresolved decisions. Use the existing [phase workflow](harness/README.md) for implementation approval.
2. Branch from `develop` and open pull requests against `develop`; `main` only receives the release pull request. Keep a PR to one outcome. Ask before adding dependencies or changing a shared contract. Humans own the architectural decisions, review, commits and pushes unless explicitly delegated.
3. Use Arrange–Act–Assert and `should_<result>_when_<condition>`. The reviewer checks one main flow, a boundary case and the relevant architecture constraint. Record actual results and anything untested.
4. Update the README and editable diagrams if the design changes. For significant AI use, add a task entry and index it in [AI_USAGE.md](AI_USAGE.md). Entries are numbered sequentially: before merging, take the next free number on `develop`. Link the PR, distinguish generated work from human changes, and use only the model identifier actually reported by the tool.

## Verification

Run `npm run lint`, `npm test`, `npm run test:e2e` and `npm run build`. Exercise database changes against PostgreSQL with the committed migrations. For a documentation-only change, check local links, render edited Mermaid files and compare every image with its source.
