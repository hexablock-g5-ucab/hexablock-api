import { Module } from '@nestjs/common';
import { AuthController } from '../interfaces/http/auth/auth.controller';

@Module({
  controllers: [AuthController],
})
export class AuthModule {}
