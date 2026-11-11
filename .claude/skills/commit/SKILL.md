---
name: commit
description: Propose a Conventional Commit message for the staged changes. Use whenever the user wants to commit.
---
# commit

1. Run `git diff --staged --stat` and `git diff --staged`.
2. Pick the type and the scope from `commitlint.config.mjs` (scope is mandatory).
3. Subject: imperative, lower case, <= 72 chars, no period, in English.
4. Body only if the why is not obvious. Footer `Refs: UC-xxx, FR-xxx`; add
   `AI-Assisted: <model> (AI-xxx)` if AI produced part of the change.
5. If the staged diff mixes two concerns, propose splitting it.
6. Print the final command. Never run `git commit` yourself.
