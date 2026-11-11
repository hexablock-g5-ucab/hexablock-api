# HexaBlock Suite — API

![CI](https://github.com/hexablock-g5-ucab/hexablock-api/actions/workflows/ci.yml/badge.svg)
![License](https://img.shields.io/badge/license-MIT-green)

REST API for HexaBlock Suite: users (JWT), progress per `gameId`, leaderboards and level definitions.
NestJS + Prisma + PostgreSQL. Client: [hexablock-g5-ucab/hexablock-app](https://github.com/hexablock-g5-ucab/hexablock-app).

## Architecture
`src/domain` ← `src/application` (use cases, ports, aspects) ← `src/infrastructure` (Prisma, JWT, bcrypt)
← `src/interfaces/http` (controllers, DTOs). Nest modules only wire things together.
![Clean Architecture](docs/diagrams/clean-architecture.png)

## Generic Engine
The API does not run the game. Its generic part is the level contract: one envelope for every variant and
a `spec` section validated per `gameId` ([schemas/level.schema.json](schemas/level.schema.json)).

## Design Patterns · SOLID Principles · AOP
_Week 4: real examples with file links. Aspects are use-case decorators (logging, retry, authorization)._

## Key Endpoints
Swagger UI at `/api/docs`. Errors follow RFC 9457 (`application/problem+json`).

## Getting Started
Requirements: Node.js 24 (see `.nvmrc`), Docker (for PostgreSQL).

```bash
cp .env.example .env
npm install          # also installs the git hooks (lefthook)
docker compose up -d db
npx prisma migrate dev
npm run start:dev
```

## Running Tests
```bash
npm run lint
npm run test
npm run test:e2e   # needs the database running
```

## AI Usage Documentation
See [AI_USAGE.md](AI_USAGE.md) and [harness/](harness/README.md).

## Contributing · License
[CONTRIBUTING.md](CONTRIBUTING.md) · MIT
