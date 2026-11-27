import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotImplementedException,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ApiProblemResponses } from '../filters/api-problem-responses.decorator';
import {
  AccessTokenResponseDto,
  LoginRequestDto,
  RegisterRequestDto,
  UserProfileResponseDto,
} from './auth.dto';

@ApiTags('auth')
@Controller()
export class AuthController {
  @Post('auth/register')
  @ApiOperation({ summary: 'Register a player account' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Account created',
    type: UserProfileResponseDto,
  })
  @ApiProblemResponses(400, 409, 501)
  register(@Body() _body: RegisterRequestDto): UserProfileResponseDto {
    throw new NotImplementedException();
  }

  @Post('auth/login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Log in and obtain a JWT' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Credentials accepted',
    type: AccessTokenResponseDto,
  })
  @ApiProblemResponses(400, 401, 501)
  login(@Body() _body: LoginRequestDto): AccessTokenResponseDto {
    throw new NotImplementedException();
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Read the authenticated player profile' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Profile of the token owner',
    type: UserProfileResponseDto,
  })
  @ApiProblemResponses(401, 501)
  me(): UserProfileResponseDto {
    throw new NotImplementedException();
  }
}
