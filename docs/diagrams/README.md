# API class model v5

- **REST API model** · [Image](05-api.png) · [Editable source](05-api.mmd)
- **Clean Architecture** · [Image](clean-architecture.png) · [Editable source](clean-architecture.mmd)

The model extends the team's v4 API view. Colours identify entities, use cases, adapters and Nest wiring. The orange border marks the extension contract for a level validator.

- Derive the user ID from the verified identity and isolate progress by user and game. Keep the highest score and stars per level and the union of completed levels, including concurrent and repeated syncs.
- Restrict level publication to admins. Validate the envelope, then dispatch the spec by game ID. Persist board and spec together under (gameId, levelId). Map wire order to Prisma sortOrder. Include board storage in the initial migration. Keep wire schemaVersion separate from the content revision.
- Round-trip acceptance case: publish a Sort level with a non-default radius, restart the API, fetch it and compare its board, goals, colours and seed. The mobile client must construct the same board.
- Validate game IDs on progress, scores and rankings. On level routes, also require a registered level-based variant. Compose LoggingUseCase around a use case and inject a logger port.

After editing the class model, regenerate from this directory:

```sh
mmdc -i 05-api.mmd -o 05-api.png -w 2400 -s 2 -b white
```
