# Contributing to hexablock-api

## Workflow

1. Pick a card from the GitHub Project board (columns: Todo → In progress → In review → Done).
2. Every behaviour change starts in `docs/specs/use-cases/UC-xxx.md`. Get the spec reviewed first.
3. Create a short-lived branch from `main`:

   | Prefix | Use |
   | --- | --- |
   | `feat/` | new behaviour (`feat/uc-004-sort-cascade`) |
   | `fix/` | bug fix (`fix/merge-slide-north-west`) |
   | `test/` | tests only |
   | `refactor/` | no behaviour change |
   | `docs/` | documentation only |
   | `ci/`, `chore/` | tooling |

4. Keep tasks to one day of work. Commit small and often.
5. Open a pull request using the template. CI must be green and one teammate must approve.
   Nobody approves their own PR.
6. Merge with **Rebase and merge** (the only merge method enabled). It keeps each author's commits.

## Commit messages (Conventional Commits, English, enforced by commitlint)

```
<type>(<scope>): <imperative subject in lower case, max 72 chars, no period>

<optional body: what and why, wrapped at 100 chars>

Refs: UC-004, FR-012
AI-Assisted: Claude Opus 5.5 (AI-014)      <- only if AI produced part of the change
Co-authored-by: Name <email>               <- pair work
```

Types: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`, `ci`, `build`, `perf`, `style`, `revert`.

Scopes: `auth`, `users`, `progress`, `leaderboard`, `levels`, `api`, `db`, `domain`, `app`, `infra`, `aop`, `docs`, `ci`, `deps`, `repo`.

Examples:

```
feat(engine): add generic HexBoard with axial coordinates
test(sort): cover cascade tie-breaking by coordinate order
fix(merge): merge each tile at most once per slide
docs(readme): document bounded generics
```

Breaking changes: add `!` after the scope (`feat(engine)!: ...`) and a `BREAKING CHANGE:` footer.

## Definition of Done

- [ ] Behaviour matches the linked use case (no more, no less)
- [ ] Tests follow AAA, are named `should_<result>_when_<condition>` and grouped by UC id
- [ ] `npm run lint && npm test && npm run test:e2e` passes locally
- [ ] Docs updated (README section, ADR, handoff) when relevant
- [ ] `AI_USAGE.md` / `docs/ai-log/` entry written if AI was used
- [ ] The author can explain every line in the defense
