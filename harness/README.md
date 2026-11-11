# Harness

How we work with AI agents in this repository. Every phase (a task of at most one day, linked to a
use case) follows the same loop:

1. Copy `templates/phase_prompt_template.md`, fill the task and constraints.
2. Run `checklists/pre_implementation.md` (audit, confidence >= 95 %, human approval).
3. Implement; then `checklists/post_implementation.md`.
4. `checklists/pre_commit.md` before every commit.
5. Update `docs/HANDOFF.md` (template in `templates/handoff_update_template.md`),
   `context/phase_registry.md` and `metrics/improvement_log.md`.

The `harness/` workflow is adapted from the reference repositories of Group 8 (github.com/arjperez-dev/frontend-poc-arrow and backend-poc-arrow), cited per the course integrity policy. We added: use-case traceability, model routing (which Claude model for which task) and
the `.claude/` agents and skills that automate the loop.
