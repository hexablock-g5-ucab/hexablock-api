import { FakePasswordHasher } from '../../../../test/helpers/fake-password-hasher';
import { InMemoryUserRepository } from '../../../../test/helpers/in-memory-user-repository';
import { EmailAlreadyRegisteredError } from '../../errors/email-already-registered.error';
import {
  RegisterUserUseCase,
  type RegisterUserInput,
} from './register-user.use-case';

describe('RegisterUserUseCase', () => {
  let users: InMemoryUserRepository;
  let hasher: FakePasswordHasher;
  let useCase: RegisterUserUseCase;

  const input: RegisterUserInput = {
    email: 'ana@example.com',
    password: 'correct horse battery',
    displayName: 'Ana',
  };

  beforeEach(() => {
    users = new InMemoryUserRepository();
    hasher = new FakePasswordHasher();
    useCase = new RegisterUserUseCase(users, hasher);
  });

  it('should_return_player_profile_when_registration_is_valid', async () => {
    // Act
    const profile = await useCase.execute(input);

    // Assert
    expect(profile).toEqual({
      id: 'user-1',
      email: 'ana@example.com',
      displayName: 'Ana',
      role: 'PLAYER',
    });
  });

  it('should_store_normalized_email_when_email_has_spaces_and_upper_case', async () => {
    // Act
    const profile = await useCase.execute({
      ...input,
      email: '  Ana@Example.COM ',
    });

    // Assert
    expect(profile.email).toBe('ana@example.com');
    expect(users.stored[0].user.email).toBe('ana@example.com');
  });

  it('should_assign_player_role_when_input_tries_to_set_admin_role', async () => {
    // Arrange
    const withRole = { ...input, role: 'ADMIN' } as RegisterUserInput;

    // Act
    const profile = await useCase.execute(withRole);

    // Assert
    expect(profile.role).toBe('PLAYER');
    expect(users.stored[0].user.role).toBe('PLAYER');
  });

  it('should_throw_EmailAlreadyRegisteredError_when_email_is_taken', async () => {
    // Arrange
    await useCase.execute(input);

    // Act
    const act = useCase.execute({ ...input, displayName: 'Other' });

    // Assert
    await expect(act).rejects.toThrow(EmailAlreadyRegisteredError);
    expect(users.stored).toHaveLength(1);
  });

  it('should_throw_EmailAlreadyRegisteredError_when_email_differs_only_in_case_and_spaces', async () => {
    // Arrange
    await useCase.execute(input);

    // Act
    const act = useCase.execute({ ...input, email: ' ANA@example.Com  ' });

    // Assert
    await expect(act).rejects.toThrow(EmailAlreadyRegisteredError);
    expect(users.stored).toHaveLength(1);
  });

  it('should_not_hash_password_when_email_is_taken', async () => {
    // Arrange
    await useCase.execute(input);
    hasher.hashCalls.length = 0;

    // Act
    const act = useCase.execute(input);

    // Assert
    await expect(act).rejects.toThrow(EmailAlreadyRegisteredError);
    expect(hasher.hashCalls).toHaveLength(0);
  });

  it('should_store_hash_instead_of_plain_password_when_registering', async () => {
    // Act
    await useCase.execute(input);

    // Assert
    const [row] = users.stored;
    expect(hasher.hashCalls).toEqual([input.password]);
    expect(row.passwordHash).toBe('fake-hash-1');
    expect(row.passwordHash).not.toContain(input.password);
  });

  it('should_return_only_profile_fields_when_registering', async () => {
    // Act
    const profile = await useCase.execute(input);

    // Assert
    expect(Object.keys(profile).sort()).toEqual([
      'displayName',
      'email',
      'id',
      'role',
    ]);
    const values = JSON.stringify(profile);
    expect(values).not.toContain(input.password);
    expect(values).not.toContain(users.stored[0].passwordHash);
  });
});
