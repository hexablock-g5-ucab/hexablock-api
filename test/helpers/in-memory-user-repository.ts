import { EmailAlreadyRegisteredError } from '../../src/application/errors/email-already-registered.error';
import type {
  NewUser,
  UserCredentials,
  UserRepository,
} from '../../src/application/ports/user-repository.port';
import type { User } from '../../src/domain/users/user';

interface StoredUser {
  user: User;
  passwordHash: string;
}

/** In-memory UserRepository. Emails are compared exactly, as the database does after normalisation. */
export class InMemoryUserRepository implements UserRepository {
  private readonly rows: StoredUser[] = [];
  private nextId = 1;

  /** Snapshot of what was persisted, for assertions on the stored hash. */
  get stored(): readonly StoredUser[] {
    return this.rows.map((row) => ({ ...row, user: { ...row.user } }));
  }

  findByEmail(email: string): Promise<User | null> {
    const row = this.rows.find((r) => r.user.email === email);
    return Promise.resolve(row ? { ...row.user } : null);
  }

  findById(id: string): Promise<User | null> {
    const row = this.rows.find((r) => r.user.id === id);
    return Promise.resolve(row ? { ...row.user } : null);
  }

  findCredentialsByEmail(email: string): Promise<UserCredentials | null> {
    const row = this.rows.find((r) => r.user.email === email);
    return Promise.resolve(
      row ? { user: { ...row.user }, passwordHash: row.passwordHash } : null,
    );
  }

  create(input: NewUser): Promise<User> {
    if (this.rows.some((r) => r.user.email === input.email)) {
      return Promise.reject(new EmailAlreadyRegisteredError());
    }
    const user: User = {
      id: `user-${this.nextId++}`,
      email: input.email,
      displayName: input.displayName,
      role: input.role,
    };
    this.rows.push({ user, passwordHash: input.passwordHash });
    return Promise.resolve({ ...user });
  }
}
