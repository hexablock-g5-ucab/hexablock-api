import { normalizeEmail } from '../../../domain/users/email';
import { Role } from '../../../domain/users/user';
import { EmailAlreadyRegisteredError } from '../../errors/email-already-registered.error';
import type { PasswordHasher } from '../../ports/password-hasher.port';
import type { UserRepository } from '../../ports/user-repository.port';
import type { UseCase } from '../use-case';
import { toUserProfile, type UserProfile } from './user-profile';

/** No role field: every registration creates a player. */
export interface RegisterUserInput {
  email: string;
  password: string;
  displayName: string;
}

export class RegisterUserUseCase implements UseCase<
  RegisterUserInput,
  UserProfile
> {
  constructor(
    private readonly users: UserRepository,
    private readonly hasher: PasswordHasher,
  ) {}

  async execute(input: RegisterUserInput): Promise<UserProfile> {
    const email = normalizeEmail(input.email);
    if (await this.users.findByEmail(email)) {
      throw new EmailAlreadyRegisteredError();
    }

    const passwordHash = await this.hasher.hash(input.password);
    const user = await this.users.create({
      email,
      passwordHash,
      displayName: input.displayName,
      role: Role.PLAYER,
    });
    return toUserProfile(user);
  }
}
