import { Module } from '@nestjs/common';
import { LeaderboardController } from '../interfaces/http/leaderboard/leaderboard.controller';

@Module({
  controllers: [LeaderboardController],
})
export class LeaderboardModule {}
