---
name: spec-use-case
description: Draft or update a system use case (UC-xxx) from a requirement before any code is written. Use when someone asks to specify, clarify or change behaviour.
---
# spec-use-case

1. Read `docs/specs/requirements.md`, `docs/specs/entity-model.md` and existing use cases.
2. Copy `docs/specs/use-cases/UC-000-template.md` to the next free id.
3. Fill: overview (goal as an outcome), preconditions, numbered main flow (actor and system
   alternate, observable steps only), alternative flows tied to a step, postconditions (success
   and failure), business rules `BR-xxx-n`, linked FR/NFR/C.
4. List open questions at the end. Status stays `Draft` until the team approves it.
5. Never describe classes or databases inside the use case.
