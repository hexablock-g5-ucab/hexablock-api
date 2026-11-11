---
name: git_workflow
type: rules
---
# Git Workflow

- Never work on `main`. One branch per phase: `<type>/<uc-id>-<short-description>`.
- Conventional Commits in English (see `CONTRIBUTING.md`); scope is mandatory.
- Add `Refs:` with UC/FR ids and `AI-Assisted:` when AI produced part of the change.
- Never force-push shared branches. Never modify remotes.
- Agents never commit or push automatically: they propose the message, a human runs it.
