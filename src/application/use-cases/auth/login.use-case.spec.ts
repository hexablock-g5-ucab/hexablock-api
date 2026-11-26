import { FakePasswordHasher } from '../../../../test/helpers/fake-password-hasher';
import { FakeTokenService } from '../../../../test/helpers/fake-token-service';
import { InMemoryUserRepository } from '../../../../test/helpers/in-memory-user-repository';
import { Role } from '../../../domain/users/user';
import { InvalidCredentialsError } from '../../errors/invalid-credentials.error';
import { LoginUseCase } from './login.use-case';

describe('LoginUseCase', () => {
  const email = 'ana@example.com';
  const password = 'correct horse battery';

  let users: InMemoryUserRepository;
  let hasher: FakePasswordHasher;
  let tokens: FakeTokenService;
  let useCase: LoginUseCase;
  let storedHash: string;

  beforeEach(async () => {
    users = new InMemoryUserRepository();
    hasher = new FakePasswordHasher();
    tokens = new FakeTokenService();
    useCase = new LoginUseCase(users, hasher, tokens);

    storedHash = await hasher.hash(password);
    await users.create({
      email,
      passwordHash: storedHash,
      displayName: 'Ana',
      role: Role.PLAYER,
    });
    hasher.hashCalls.length = 0;
  });

  async function captureError(promise: Promise<unknown>): Promise<Error> {
    try {
      await promise;
    } catch (error) {
      return error as Error;
    }
    throw new Error('Expected the login to fail');
  }

  it('should_return_access_token_when_credentials_are_valid', async () => {
    // Act
    const result = await useCase.execute({ email, password });

    // Assert
    expect(result).toEqual({ accessToken: 'token:user-1:PLAYER' });
    expect(tokens.signed).toEqual([{ sub: 'user-1', role: 'PLAYER' }]);
  });

  it('should_return_access_token_when_email_differs_in_case_and_spaces', async () => {
    // Act
    const result = await useCase.execute({
      email: '  ANA@Example.com ',
      password,
    });

    // Assert
    expect(result.accessToken).toBe('token:user-1:PLAYER');
  });

  it('should_throw_InvalidCredentialsError_when_email_is_unknown', async () => {
    // Act
    const act = useCase.execute({ email: 'nobody@example.com', password });

    // Assert
    await expect(act).rejects.toThrow(InvalidCredentialsError);
    expect(tokens.signed).toHaveLength(0);
  });

  it('should_throw_InvalidCredentialsError_when_password_is_wrong', async () => {
    // Act
    const act = useCase.execute({ email, password: 'wrong password' });

    // Assert
    await expect(act).rejects.toThrow(InvalidCredentialsError);
    expect(tokens.signed).toHaveLength(0);
  });

  it('should_throw_identical_error_when_email_is_unknown_or_password_is_wrong', async () => {
    // Act
    const unknownEmail = await captureError(
      useCase.execute({ email: 'nobody@example.com', password }),
    );
    const wrongPassword = await captureError(
      useCase.execute({ email, password: 'wrong password' }),
    );

    // Assert
    expect(unknownEmail).toBeInstanceOf(InvalidCredentialsError);
    expect(wrongPassword).toBeInstanceOf(InvalidCredentialsError);
    expect(unknownEmail.name).toBe(wrongPassword.name);
    expect(unknownEmail.message).toBe(wrongPassword.message);
  });

  it('should_verify_against_dummy_hash_when_email_is_unknown', async () => {
    // Act
    const act = useCase.execute({ email: 'nobody@example.com', password });

    // Assert
    await expect(act).rejects.toThrow(InvalidCredentialsError);
    expect(hasher.hashCalls).toHaveLength(1);
    expect(hasher.verifyCalls).toHaveLength(1);
    expect(hasher.verifyCalls[0].plain).toBe(password);
    expect(hasher.verifyCalls[0].hash).not.toBe(storedHash);
  });

  it('should_reuse_same_dummy_hash_when_unknown_emails_repeat', async () => {
    // Act
    await expect(
      useCase.execute({ email: 'one@example.com', password }),
    ).rejects.toThrow(InvalidCredentialsError);
    await expect(
      useCase.execute({ email: 'two@example.com', password }),
    ).rejects.toThrow(InvalidCredentialsError);

    // Assert
    expect(hasher.hashCalls).toHaveLength(1);
    expect(hasher.verifyCalls).toHaveLength(2);
    expect(hasher.verifyCalls[0].hash).toBe(hasher.verifyCalls[1].hash);
  });

  it('should_not_accept_dummy_password_when_email_is_unknown', async () => {
    // Act: the dummy hash matches this password, yet the login must still fail.
    const act = useCase.execute({
      email: 'nobody@example.com',
      password: 'hexablock-login-dummy-password',
    });

    // Assert
    await expect(act).rejects.toThrow(InvalidCredentialsError);
    expect(tokens.signed).toHaveLength(0);
  });
});
