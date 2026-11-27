import { InMemoryUserRepository } from '../../../../test/helpers/in-memory-user-repository';
import { Role } from '../../../domain/users/user';
import { UserNotFoundError } from '../../errors/user-not-found.error';
import { ReadProfileUseCase } from './read-profile.use-case';

describe('ReadProfileUseCase', () => {
  let users: InMemoryUserRepository;
  let useCase: ReadProfileUseCase;

  beforeEach(() => {
    users = new InMemoryUserRepository();
    useCase = new ReadProfileUseCase(users);
  });

  it('should_return_profile_when_user_exists', async () => {
    // Arrange
    const created = await users.create({
      email: 'admin@example.com',
      passwordHash: 'stored-hash',
      displayName: 'Admin',
      role: Role.ADMIN,
    });

    // Act
    const profile = await useCase.execute({ userId: created.id });

    // Assert
    expect(profile).toEqual({
      id: created.id,
      email: 'admin@example.com',
      displayName: 'Admin',
      role: 'ADMIN',
    });
    expect(JSON.stringify(profile)).not.toContain('stored-hash');
  });

  it('should_throw_UserNotFoundError_when_user_does_not_exist', async () => {
    // Act
    const act = useCase.execute({ userId: 'missing-user' });

    // Assert
    await expect(act).rejects.toThrow(UserNotFoundError);
  });
});
