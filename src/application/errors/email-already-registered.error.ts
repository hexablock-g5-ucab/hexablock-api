/** The email is already in use. The message never includes the email itself. */
export class EmailAlreadyRegisteredError extends Error {
  override name = 'EmailAlreadyRegisteredError';

  constructor() {
    super('The email is already registered.');
  }
}
