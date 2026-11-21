# Working on the HexaBlock REST API

## Start here

Read the [assessed scope](docs/specs/requirements.md), the relevant use case under `docs/specs/use-cases/` and the [v5 class model](docs/diagrams/README.md). The team confirmed the professor removed Hexa Fit. Deliver Lines, Sort and Merge. Treat the model as the design baseline and the implementation and tests as evidence of current behaviour.

## Architecture

- Keep entities and policies independent of Nest and Prisma. Application use cases depend on ports. HTTP controllers and persistence adapters translate data. Nest modules wire concrete dependencies.
- Derive the player from authentication. Scope progress to player and game, and level progress to player, game and level. Verify a repeated sync and concurrent updates preserve the best result.
- Preserve the complete level envelope on a publish/read round trip. Sort is the only assessed level-based game. Admin authorization is required to publish. Return consistent problem details for invalid input.
- Wrap use cases for logging. Inject a logger port when wiring the existing decorator; keep credentials and personal data out of logs. Never read or publish local secrets.

## Working agreement

1. Start behaviour changes from an approved use case. Name the acceptance checks and unresolved decisions. Use the existing [phase workflow](harness/README.md) for implementation approval.
2. Keep a PR to one outcome. Ask before adding dependencies or changing a shared contract. Humans own the architectural decisions, review, commits and pushes unless explicitly delegated.
3. Use Arrange–Act–Assert and `should_<result>_when_<condition>`. The reviewer checks one main flow, a boundary case and the relevant architecture constraint. Record actual results and anything untested.
4. Update the README and editable diagrams if the design changes. For significant AI use, add a task entry and index it in [AI_USAGE.md](AI_USAGE.md). Link the PR, distinguish generated work from human changes, and use only the model identifier actually reported by the tool.

## Verification

Run `npm run lint`, `npm test`, `npm run test:e2e` and `npm run build`. Exercise database changes against PostgreSQL with the committed migrations. For a documentation-only change, check local links, render edited Mermaid files and compare every image with its source.
