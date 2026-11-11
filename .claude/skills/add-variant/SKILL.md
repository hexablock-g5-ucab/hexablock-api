---
name: add-variant
description: Guide for adding a new game variant without touching the engine (the defense exercise). Use when asked how to add a fifth variant or a new rule.
---
# add-variant

Follow `docs/EXTENSIBILITY.md` step by step and verify at the end that `git diff` shows no change
under the engine core, the generic use cases or the shared screens. If a change there seems
necessary, stop and call the `architect` agent: it means an extension point is missing.
