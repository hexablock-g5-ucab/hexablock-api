import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { ApiParam } from '@nestjs/swagger';
import {
  type GameId,
  isSupportedGame,
  SUPPORTED_GAMES,
} from '../../domain/games/supported-games';

/** Rejects any `:gameId` outside SUPPORTED_GAMES with 400 problem+json. */
@Injectable()
export class GameIdPipe implements PipeTransform<unknown, GameId> {
  transform(value: unknown): GameId {
    if (!isSupportedGame(value)) {
      throw new BadRequestException(
        `gameId must be one of: ${SUPPORTED_GAMES.join(', ')}`,
      );
    }
    return value;
  }
}

/** Documents the `:gameId` path parameter with its allowed values. */
export const ApiGameIdParam = () =>
  ApiParam({
    name: 'gameId',
    enum: SUPPORTED_GAMES,
    description: 'Game variant identifier',
  });
