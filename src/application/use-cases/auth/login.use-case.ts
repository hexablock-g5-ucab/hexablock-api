import { normalizeEmail } from '../../../domain/users/email';
import { InvalidCredentialsError } from '../../errors/invalid-credentials.error';
import type { PasswordHasher } from '../../ports/password-hasher.port';
import type { TokenService } from '../../ports/token-service.port';
import type { UserRepository } from '../../ports/user-repository.port';
import type { UseCase } from '../use-case';

export interface LoginInput {
  email: string;
  password: string;
}

export interface LoginOutput {
  accessToken: string;
}

/** Hashed once to get a hash in the adapter's own format; no account can match it. */
const DUMMY_PASSWORD = 'hexablock-login-dummy-password';

export class LoginUseCase implements UseCase<LoginInput, LoginOutput> {
  private dummyHash: Promise<string> | undefined;

  constructor(
    private readonly users: UserRepository,
    private readonly hasher: PasswordHasher,
    private readonly tokens: TokenService,
  ) {}

  async execute(input: LoginInput): Promise<LoginOutput> {
    const credentials = await this.users.findCredentialsByEmail(
      normalizeEmail(input.email),
    );

    if (!credentials) {
      // Same verify work as a known email, so response time does not reveal which emails exist.
      await this.hasher.verify(input.password, await this.getDummyHash());
      throw new InvalidCredentialsError();
    }

    const valid = await this.hasher.verify(
      input.password,
      credentials.passwordHash,
    );
    if (!valid) {
      throw new InvalidCredentialsError();
    }

    const { id, role } = credentials.user;
    return { accessToken: await this.tokens.sign({ sub: id, role }) };
  }

  /** Computed on first use and then reused, so every unknown-email login verifies against the same hash. */
  private getDummyHash(): Promise<string> {
    this.dummyHash ??= this.hasher
      .hash(DUMMY_PASSWORD)
      .catch((error: unknown) => {
        this.dummyHash = undefined;
        throw error;
      });
    return this.dummyHash;
  }
}
