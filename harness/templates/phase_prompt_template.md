# PHASE [NN] — [Title]   (UC-xxx · FR-xxx)

Read before starting:
- `AGENTS.md`
- `docs/specs/use-cases/UC-xxx-....md`
- `harness/context/current_constraints.md`
- `docs/HANDOFF.md`

## Mandatory pre-implementation

1. Audit every file relevant to this task (read, not just list).
2. Explain your understanding of the current state and of the use case.
3. State your confidence. It must be >= 95 %; otherwise ask clarifying questions.
4. Propose the list of files to create/modify and the tests (one per flow and rule).
5. **Wait for explicit approval before writing code.**

## Task

[Concrete deliverables. Files to create or modify.]

## Constraints

- Implement only what UC-xxx says: no more, no less.
- Respect `harness/rules/architecture_boundary.md`.
- Do not add dependencies. Do not commit or push.
- [Phase-specific constraints]

## Validation

```bash
npm run lint
npm run test
npm run test:e2e
```

## After completion

1. Update `docs/HANDOFF.md` with `harness/templates/handoff_update_template.md`.
2. Update `harness/context/phase_registry.md` and `harness/metrics/improvement_log.md`.
3. Draft `docs/ai-log/AI-xxx.md` and propose a Conventional Commit message.

Be direct. No filler.
