import { BadRequestException } from '@nestjs/common';
import { SUPPORTED_GAMES } from '../../domain/games/supported-games';
import { GameIdPipe } from './game-id.pipe';

describe('GameIdPipe', () => {
  const pipe = new GameIdPipe();

  it.each(SUPPORTED_GAMES)(
    'should_return_the_gameId_when_it_is_supported (%s)',
    (gameId) => {
      // Arrange: a supported id. Act
      const result = pipe.transform(gameId);

      // Assert
      expect(result).toBe(gameId);
    },
  );

  it.each(['hexa-fit', 'HEXA-SORT', '', undefined])(
    'should_throw_bad_request_when_gameId_is_not_supported (%s)',
    (gameId) => {
      // Arrange: an unsupported id. Act + Assert
      expect(() => pipe.transform(gameId)).toThrow(BadRequestException);
    },
  );
});
