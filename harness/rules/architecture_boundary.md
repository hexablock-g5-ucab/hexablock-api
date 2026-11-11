---
name: architecture_boundary
type: rules
---
# Architecture Boundaries

- **domain:** entities, value objects and policies (e.g. leaderboard ranking). No framework imports.
- **application:** use cases + ports + aspects (decorators). Imports domain only.
- **infrastructure:** Prisma repositories, JWT and bcrypt adapters. Implements application ports.
- **interfaces/http:** controllers, DTOs (class-validator), guards, problem+json filter.
- **modules:** Nest modules = composition root; bind ports to adapters with injection tokens.

```
domain ← application ← infrastructure / interfaces ← modules
```
