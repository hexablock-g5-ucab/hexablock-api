---
name: add-variant
description: Guide for supporting a new game variant in the API without touching controllers or use cases (the defense exercise). Use when asked how the backend handles a fifth variant or a new level format.
---
# add-variant (backend)

The API is variant-agnostic: progress, scores and leaderboards are keyed by `gameId`, and levels use
one envelope with a `spec` section per `gameId`.

1. Add the new `gameId` and its `spec` sub-schema to `schemas/level.schema.json`.
2. If the variant has levels, register its spec validator next to the existing ones (no `switch` on
   `gameId` in use cases or controllers).
3. Add e2e tests that sync progress, submit a score and fetch levels for the new `gameId`.
4. Verify that `git diff` shows no change under `src/application/use-cases/` or `src/interfaces/http/`.
   If a change there seems necessary, stop and call the `architect` agent: an extension point is missing.
