# AI Usage — backend (hexablock-api)

Mandatory per section 7 of the project statement. Every significant use of AI gets one entry here
(summary row) and one detailed file in `docs/ai-log/AI-xxx.md`. Entries are closed when their PR is
merged: no field may stay "Pending" after merge.

The `harness/` workflow is adapted from the reference repositories of Group 8 (github.com/arjperez-dev/frontend-poc-arrow and backend-poc-arrow), cited per the course integrity policy.

## Tools with recorded use

| Tool and model | Recorded role |
| --- | --- |
| Claude Opus 5.5 (as reported in AI-001 and AI-002) | Initial analysis, repository scaffold review and tooling |
| OpenAI Codex, GPT-6 | Class-model review, documentation and repository preparation |
| Gemini (model not shown by the interface) | Review of the v6.1–v6.3 class model (AI-004) |

Record additional tools when they are actually used. If the interface does not identify the exact model, record that fact.

## Log

| ID | Date | Phase / UC | Tool | Task | Files / PR | % AI in PR |
| --- | --- | --- | --- | --- | --- | --- |
| [AI-001](docs/ai-log/AI-001.md) | 2026-11-10 | Planning | Claude Opus 5.5 | Analysis of the statement, class-diagram review, architecture and weekly plan | docs/ | 0 (no code) |
| [AI-002](docs/ai-log/AI-002.md) | 2026-11-11 | P00 bootstrap | Claude Opus 5.5 | Repository audit against the statement and setup fixes | .github/, .claude/, docs/ | 100 (tooling only) |
| [AI-003](docs/ai-log/AI-003.md) | 2026-11-20 | Design baseline | OpenAI Codex | Final class model and documentation | [Model](docs/diagrams/README.md) | N/A (documentation) |
| [AI-004](docs/ai-log/AI-004.md) | 2026-11-23 | Design baseline v6.3 | Claude Opus 5.5, reviewed with Gemini | Class model v6.3 and complete README diagram | [Model](docs/diagrams/README.md) | N/A (documentation) |

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

## Critical evaluation

Estimate the share of AI-assisted product code at PR review. For each code PR record the affected files, approximate assisted lines and total product lines added or materially changed. Aggregate the numerator and denominator with the same convention. Exclude generated platform files, lockfiles and documentation. Commit trailers identify assisted work but do not measure its volume.

AI-001 and AI-002 contain historical estimates and unfinished human reflections. Confirm those entries with their authors. The overall product-code estimate will be meaningful once reviewed game features land. AI-003 records a concrete design correction and separates the team's input from the assistant's output.
