import {
  BadRequestException,
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
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { GameId } from '../../../domain/games/supported-games';
import { ApiProblemResponses } from '../filters/api-problem-responses.decorator';
import { ApiGameIdParam, GameIdPipe } from '../game-id.pipe';
import {
  LevelDefinitionResponseDto,
  UpsertLevelRequestDto,
} from './levels.dto';

@ApiTags('levels')
@ApiGameIdParam()
@Controller('games/:gameId/levels')
export class LevelsController {
  @Get()
  @ApiOperation({ summary: 'List the level definitions of a game' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Level definitions ordered by order',
    type: [LevelDefinitionResponseDto],
  })
  @ApiProblemResponses(400, 501)
  list(
    @Param('gameId', GameIdPipe) _gameId: GameId,
  ): LevelDefinitionResponseDto[] {
    throw new NotImplementedException();
  }

  @Put(':levelId')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Publish or update a level definition (admin)',
    description: 'Stores board and spec together under (gameId, levelId).',
  })
  @ApiParam({ name: 'levelId', example: 'sort-001' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Stored level definition',
    type: LevelDefinitionResponseDto,
  })
  @ApiProblemResponses(400, 401, 403, 501)
  upsert(
    @Param('gameId', GameIdPipe) gameId: GameId,
    @Param('levelId') levelId: string,
    @Body() body: UpsertLevelRequestDto,
  ): LevelDefinitionResponseDto {
    assertEnvelopeMatchesPath(body, gameId, levelId);
    throw new NotImplementedException();
  }
}

/** A body that repeats the envelope ids must name the same level as the path. */
function assertEnvelopeMatchesPath(
  body: UpsertLevelRequestDto,
  gameId: GameId,
  levelId: string,
): void {
  if (body.gameId !== undefined && body.gameId !== gameId) {
    throw new BadRequestException('gameId in the body must match the path');
  }
  if (body.levelId !== undefined && body.levelId !== levelId) {
    throw new BadRequestException('levelId in the body must match the path');
  }
}
