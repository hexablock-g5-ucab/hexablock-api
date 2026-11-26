import type { PasswordHasher } from '../../src/application/ports/password-hasher.port';

/**
 * Hashes are opaque tokens (`fake-hash-N`) that never contain the plain text,
 * so a test can tell a stored hash from a stored password.
 */
export class FakePasswordHasher implements PasswordHasher {
  readonly hashCalls: string[] = [];
  readonly verifyCalls: Array<{ plain: string; hash: string }> = [];
  private readonly plainByHash = new Map<string, string>();

  hash(plain: string): Promise<string> {
    this.hashCalls.push(plain);
    const hash = `fake-hash-${this.plainByHash.size + 1}`;
    this.plainByHash.set(hash, plain);
    return Promise.resolve(hash);
  }

  verify(plain: string, hash: string): Promise<boolean> {
    this.verifyCalls.push({ plain, hash });
    return Promise.resolve(this.plainByHash.get(hash) === plain);
  }
}
