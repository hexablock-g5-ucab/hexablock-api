/**
 * Raised for an unknown email and for a wrong password alike, with the same
 * message, so a caller cannot tell which accounts exist.
 */
export class InvalidCredentialsError extends Error {
  override name = 'InvalidCredentialsError';

  constructor() {
    super('Invalid email or password.');
  }
}
