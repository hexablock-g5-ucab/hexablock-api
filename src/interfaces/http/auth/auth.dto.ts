import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegisterRequestDto {
  @ApiProperty({ example: 'player@example.com', maxLength: 254 })
  @IsEmail()
  @MaxLength(254)
  email: string;

  /** bcrypt only uses the first 72 bytes, so longer passwords are rejected. */
  @ApiProperty({ minLength: 8, maxLength: 72, format: 'password' })
  @IsString()
  @MinLength(8)
  @MaxLength(72)
  password: string;

  @ApiProperty({ example: 'Daniel', minLength: 1, maxLength: 50 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  displayName: string;
}

export class LoginRequestDto {
  @ApiProperty({ example: 'player@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ format: 'password' })
  @IsString()
  @IsNotEmpty()
  password: string;
}

export class AccessTokenResponseDto {
  @ApiProperty({
    description: 'JWT to send as `Authorization: Bearer <token>`',
  })
  accessToken: string;
}

export class UserProfileResponseDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ example: 'player@example.com' })
  email: string;

  @ApiProperty({ example: 'Daniel' })
  displayName: string;

  @ApiProperty({ enum: ['PLAYER', 'ADMIN'] })
  role: 'PLAYER' | 'ADMIN';
}
