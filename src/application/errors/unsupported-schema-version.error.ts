import { SUPPORTED_LEVEL_SCHEMA_VERSION } from '../../domain/levels/level-definition';

/** The level's `schemaVersion` is not a wire format the API accepts (UC-103). */
export class UnsupportedSchemaVersionError extends Error {
  override name = 'UnsupportedSchemaVersionError';

  constructor() {
    super(`schemaVersion must be ${SUPPORTED_LEVEL_SCHEMA_VERSION}.`);
  }
}
