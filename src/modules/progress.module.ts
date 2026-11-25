import { Module } from '@nestjs/common';
import { ProgressController } from '../interfaces/http/progress/progress.controller';

@Module({
  controllers: [ProgressController],
})
export class ProgressModule {}
