import type { Role, User } from '../../domain/users/user';

export const USER_REPOSITORY = Symbol('UserRepository');

export interface NewUser {
  email: string;
  passwordHash: string;
  displayName: string;
  role: Role;
}

/** Only returned to the login flow: the one place where the hash leaves the repository. */
export interface UserCredentials {
  user: User;
  passwordHash: string;
}

/**
 * Users are looked up by normalised email. Adapters must map a unique-constraint
 * violation on `create` to `EmailAlreadyRegisteredError`, so two concurrent
 * registrations of the same email cannot both succeed.
 */
export interface UserRepository {
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  findCredentialsByEmail(email: string): Promise<UserCredentials | null>;
  create(user: NewUser): Promise<User>;
}
