import {
  Body,
  Controller,
  Get,
  HttpStatus,
  NotImplementedException,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { GameId } from '../../../domain/games/supported-games';
import { ApiProblemResponses } from '../filters/api-problem-responses.decorator';
import { ApiGameIdParam, GameIdPipe } from '../game-id.pipe';
import {
  LeaderboardQueryDto,
  RankedEntryResponseDto,
  ScoreEntryResponseDto,
  SubmitScoreRequestDto,
} from './leaderboard.dto';

@ApiTags('leaderboard')
@ApiGameIdParam()
@Controller('games/:gameId')
export class LeaderboardController {
  @Post('scores')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Submit a finished game score' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Score recorded',
    type: ScoreEntryResponseDto,
  })
  @ApiProblemResponses(400, 401, 501)
  submitScore(
    @Param('gameId', GameIdPipe) _gameId: GameId,
    @Body() _body: SubmitScoreRequestDto,
  ): ScoreEntryResponseDto {
    throw new NotImplementedException();
  }

  @Get('leaderboard')
  @ApiOperation({
    summary: 'Read the leaderboard of a game or one of its levels',
    description: "Ordered by the game's IRankingStrategy.",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Ranked entries, best first',
    type: [RankedEntryResponseDto],
  })
  @ApiProblemResponses(400, 501)
  leaderboard(
    @Param('gameId', GameIdPipe) _gameId: GameId,
    @Query() _query: LeaderboardQueryDto,
  ): RankedEntryResponseDto[] {
    throw new NotImplementedException();
  }
}
