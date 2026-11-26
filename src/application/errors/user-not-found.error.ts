/** The authenticated user no longer exists. The message never includes the user id. */
export class UserNotFoundError extends Error {
  override name = 'UserNotFoundError';

  constructor() {
    super('User not found.');
  }
}
