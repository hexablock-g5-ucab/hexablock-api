import { UserNotFoundError } from '../../errors/user-not-found.error';
import type { UserRepository } from '../../ports/user-repository.port';
import type { UseCase } from '../use-case';
import { toUserProfile, type UserProfile } from './user-profile';

/** `userId` comes from the verified access token, never from the request body. */
export interface ReadProfileInput {
  userId: string;
}

export class ReadProfileUseCase implements UseCase<
  ReadProfileInput,
  UserProfile
> {
  constructor(private readonly users: UserRepository) {}

  async execute(input: ReadProfileInput): Promise<UserProfile> {
    const user = await this.users.findById(input.userId);
    if (!user) {
      throw new UserNotFoundError();
    }
    return toUserProfile(user);
  }
}
