# AGENTS.md — HexaBlock Suite API

## Architecture (non-negotiable)
- `src/domain`: entities and policies, no NestJS, no Prisma imports.
- `src/application`: use cases depend on ports (`*.port.ts`), never on Prisma or JWT libraries.
- `src/infrastructure`: Prisma repositories, JWT and bcrypt adapters implementing the ports.
- `src/interfaces/http`: controllers and DTOs only; no business logic.
- Every progress, score and leaderboard query is keyed by `gameId`.
- Aspects (logging, retry, authorization, cache) are decorators of `UseCase<I, O>`, not AOP libraries.
- Errors: RFC 9457 problem+json through one global filter.

## Process
- Behaviour changes start in `docs/specs/use-cases/`. Follow `harness/README.md`.
- Tests: Jest, AAA, `should_<result>_when_<condition>`, grouped by UC id; e2e with supertest.
- Never add a dependency without approval. Never commit, push or touch remotes. Never read `.env`.

## Commands
```bash
npm run lint
npm run test
npm run test:e2e
```
