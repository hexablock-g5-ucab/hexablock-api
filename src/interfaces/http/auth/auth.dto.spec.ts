import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { RegisterRequestDto } from './auth.dto';

async function passwordErrors(password: string) {
  const dto = plainToInstance(RegisterRequestDto, {
    email: 'player@example.com',
    password,
    displayName: 'Player',
  });
  const errors = await validate(dto);
  return errors.filter((error) => error.property === 'password');
}

describe('RegisterRequestDto password', () => {
  it.each([
    ['72 ASCII characters (72 bytes)', 'a'.repeat(72)],
    ['36 "ñ" (72 bytes)', 'ñ'.repeat(36)],
    ['18 emoji (72 bytes)', '😀'.repeat(18)],
  ])('should_accept_password_when_it_is_%s', async (_case, password) => {
    // Arrange: a password of exactly 72 UTF-8 bytes. Act
    const errors = await passwordErrors(password);

    // Assert
    expect(errors).toEqual([]);
  });

  it.each([
    ['73 ASCII characters (73 bytes)', 'a'.repeat(73)],
    ['37 "ñ" (74 bytes)', 'ñ'.repeat(37)],
    ['19 emoji (76 bytes)', '😀'.repeat(19)],
  ])('should_reject_password_when_it_is_%s', async (_case, password) => {
    // Arrange: a password over 72 UTF-8 bytes. Act
    const errors = await passwordErrors(password);

    // Assert
    expect(errors).toHaveLength(1);
    expect(errors[0].constraints).toEqual({
      maxUtf8Bytes: 'password must be at most 72 bytes when UTF-8 encoded',
    });
  });

  it('should_reject_password_when_it_has_fewer_than_8_characters', async () => {
    // Arrange: 7 characters that take 14 bytes. Act
    const errors = await passwordErrors('ñ'.repeat(7));

    // Assert
    expect(errors).toHaveLength(1);
    expect(errors[0].constraints).toHaveProperty('minLength');
  });
});
