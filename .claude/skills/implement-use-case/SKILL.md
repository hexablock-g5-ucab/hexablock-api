---
name: implement-use-case
description: Implement an approved use case through the harness loop (audit, approval, implement, validate, handoff). Use when asked to implement UC-xxx.
---
# implement-use-case

1. Refuse to start if the UC status is not `Approved`.
2. Fill `harness/templates/phase_prompt_template.md` for this UC and run the pre-implementation checklist.
3. Wait for explicit approval of the file list and test list.
4. Implement only the UC. Run the validation commands from `harness/rules/validation_protocol.md`.
5. Update `docs/HANDOFF.md`, `harness/context/phase_registry.md`, `harness/metrics/improvement_log.md`.
6. Draft `docs/ai-log/AI-xxx.md` and propose the commit message (see the `commit` skill). Do not commit.
