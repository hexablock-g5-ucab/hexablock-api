---
name: post_implementation_checklist
type: checklists
---
# Post-Implementation Checklist

- [ ] Validation commands pass:
  ```bash
  npm run lint
npm run test
npm run test:e2e
  ```
- [ ] Each flow / rule of the UC has a test named `should_<result>_when_<condition>`
- [ ] No outward dependency introduced (architecture test green)
- [ ] Manual check done if UI, audio or network changed
- [ ] `docs/HANDOFF.md`, `phase_registry.md`, `improvement_log.md` updated
- [ ] AI log entry drafted
