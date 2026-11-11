# Requirements Catalog

Ids are stable and never reused. Source: project statement v1.0 (2026-10-23).

## Functional

| Id | Requirement | Statement § |
| --- | --- | --- |
| FR-001 | Home screen with suite name, settings and a selector of the four variants | 5.1.1 |
| FR-002 | Level selection for Fit and Sort with progress and locked levels | 5.1.2 |
| FR-003 | Generic engine shared by the four variants (board, pieces, moves, resolution, end of game) | 5.1.3 |
| FR-004 | Hexa Lines playable endlessly with high score | 5.1.4 |
| FR-005 | Hexa Merge playable endlessly with high score | 5.1.4 |
| FR-006 | Hexa Fit with >= 15 hand-designed levels loaded from configuration files | 5.1.5 |
| FR-007 | Hexa Sort with >= 10 hand-designed levels loaded from configuration files | 5.1.5 |
| FR-008 | Scoring per variant with documented criteria | 5.1.6 |
| FR-009 | Victory screen (next level / new game) and defeat screen (retry) | 5.1.7 |
| FR-010 | Unlimited undo and redo in Hexa Fit | 5.1.8 |
| FR-011 | Undo of one move in Hexa Merge | 5.1.8 |
| FR-012 | Local persistence of progress per variant (levels, stars, scores) | 5.1.9 |
| FR-013 | Sound effects and background music with mute option | 5.1.10 |
| FR-014 | Spanish and English | 5.1.11 |
| FR-015 | User registration and login with JWT | 5.2.1 |
| FR-016 | Progress synchronisation keyed by userId + gameId | 5.2.2 |
| FR-017 | Global leaderboard per gameId and per level | 5.2.3 |
| FR-018 | Get and update level definitions for Fit and Sort with a generic schema | 5.2.4 |
| FR-019 | API documented with Swagger / OpenAPI | 5.2.5 |
| FR-020 | Consistent HTTP errors (RFC 9457 problem+json) | 5.2.6 |

## Non-functional

| Id | Requirement | Statement § |
| --- | --- | --- |
| NFR-001 | Engine is generic over TCell, TMove, TState; variants are instantiations | 3.1 |
| NFR-002 | A new variant needs only new classes or configuration (documented in EXTENSIBILITY.md) | 3.1 |
| NFR-003 | SOLID applied and documented with real examples | 3.2 |
| NFR-004 | GoF patterns from the three categories; Strategy and Abstract Factory mandatory | 3.3 |
| NFR-005 | Clean Architecture with inward dependencies only | 3.4 |
| NFR-006 | At least one aspect implemented with decorators/proxies, no AOP library | 3.5 |
| NFR-007 | Unit, integration and widget tests run on every pull request | 3.6 |
| NFR-008 | Random generation is injectable and reproducible with a seed | 1.4 |

## Constraints

| Id | Requirement | Statement § |
| --- | --- | --- |
| C-001 | Client in Flutter / Dart 3 (language with generics) | Tech table |
| C-002 | Two GitHub repositories with protected branches and pull requests | 2 |
| C-003 | README and commits in English; Conventional Commits | 6 |
| C-004 | AI_USAGE.md in both repositories | 7.2 |
| C-005 | Delivery on 2026-12-14 with an Android release in GitHub | 8 |

