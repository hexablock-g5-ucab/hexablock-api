import {
  Body,
  Controller,
  Get,
  HttpStatus,
  NotImplementedException,
  Param,
  Put,
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
  GameProgressResponseDto,
  SyncProgressRequestDto,
} from './progress.dto';

@ApiTags('progress')
@ApiBearerAuth()
@ApiGameIdParam()
@Controller('progress/:gameId')
export class ProgressController {
  @Get()
  @ApiOperation({ summary: "Read the authenticated player's progress" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Stored progress for this game',
    type: GameProgressResponseDto,
  })
  @ApiProblemResponses(400, 401, 501)
  read(@Param('gameId', GameIdPipe) _gameId: GameId): GameProgressResponseDto {
    throw new NotImplementedException();
  }

  @Put()
  @ApiOperation({
    summary: 'Synchronise progress',
    description:
      'Merges monotonically: best scores take the maximum and completed levels the union.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Merged progress',
    type: GameProgressResponseDto,
  })
  @ApiProblemResponses(400, 401, 501)
  sync(
    @Param('gameId', GameIdPipe) _gameId: GameId,
    @Body() _body: SyncProgressRequestDto,
  ): GameProgressResponseDto {
    throw new NotImplementedException();
  }
}
