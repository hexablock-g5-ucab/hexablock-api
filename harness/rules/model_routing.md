---
name: model_routing
type: rules
---
# Which model for which task

| Task | Model | Why |
| --- | --- | --- |
| Engine contracts, generic bounds, cross-cutting refactors | Claude Fable 5.2 | Deepest reasoning; mistakes here spread to all four variants |
| Ambiguous rules turned into specs (Sort cascade, Fit stars) | Claude Fable 5.2 | Finds edge cases before code exists |
| Pre-Friday architecture / SOLID audit, defense rehearsal | Claude Fable 5.2 | Independent, demanding reviewer |
| Implementing an approved UC, writing its tests | Claude Opus 5.5 | Strong and fast inside clear boundaries |
| Screens, endpoints, mappers, README sections | Claude Sonnet 5.5 | Routine work with a clear pattern |
| Commit messages, ARB translations, AI log drafts | Claude Haiku 5.5 | Cheap, quick, low risk |

Rule: Fable thinks and reviews; it does not type boilerplate. Always log the model in `AI_USAGE.md`.
