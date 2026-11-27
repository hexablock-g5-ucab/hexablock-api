import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth.module';
import { LeaderboardModule } from './modules/leaderboard.module';
import { LevelsModule } from './modules/levels.module';
import { ProgressModule } from './modules/progress.module';

@Module({
  imports: [AuthModule, ProgressModule, LeaderboardModule, LevelsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
