# AI Usage — backend (hexablock-api)

Mandatory per section 7 of the project statement. Every significant use of AI gets one entry here
(summary row) and one detailed file in `docs/ai-log/AI-xxx.md`. Entries are closed when their PR is
merged: no field may stay "Pending" after merge.

The `harness/` workflow is adapted from the reference repositories of Group 8 (github.com/arjperez-dev/frontend-poc-arrow and backend-poc-arrow), cited per the course integrity policy.

## Tools

| Tool | Model / version | Role in our workflow |
| --- | --- | --- |
| Claude (claude.ai, Claude Code) | Claude Fable 5.2 | Architecture, generic contracts, hard algorithms, audits before each Friday review |
| Claude (Claude Code) | Claude Opus 5.5 | Implementing approved use cases inside the harness; writing tests |
| Claude (Claude Code) | Claude Sonnet 5.5 / Haiku 5.5 | Routine code, translations, docs drafts, commit messages |
| _add any other tool here (Copilot, ChatGPT, ...)_ | | |

## Log

| ID | Date | Phase / UC | Tool | Task | Files / PR | % AI in PR |
| --- | --- | --- | --- | --- | --- | --- |
| [AI-001](docs/ai-log/AI-001.md) | 2026-11-10 | Planning | Claude Opus 5.5 | Analysis of the statement, class-diagram review, architecture and weekly plan | docs/ | 0 (no code) |

## Entry template (copy to `docs/ai-log/AI-xxx.md`)

- Date:
- AI tool / model:
- Role of the tool:
- Task or problem addressed (UC / FR ids):
- Prompt (literal or faithful paraphrase):
- Result obtained:
- Modifications made by the team:
- Lessons learned:
- Limitations / errors found and how we detected them:
- Approximate percentage of AI-assisted code in the PR:
- Critical reflection:

## Critical evaluation (filled in week 4)

- Approximate share of AI-assisted code: computed with
  `git log --grep "AI-Assisted:" --oneline | wc -l` vs `git log --oneline | wc -l`, plus per-PR estimates.
- Cases where AI produced wrong or sub-optimal results and how we caught them:
- Impact on productivity and quality:
