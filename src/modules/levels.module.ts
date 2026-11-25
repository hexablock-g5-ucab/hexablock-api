import { Module } from '@nestjs/common';
import { LevelsController } from '../interfaces/http/levels/levels.controller';

@Module({
  controllers: [LevelsController],
})
export class LevelsModule {}
