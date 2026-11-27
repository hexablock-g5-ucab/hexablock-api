import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class SubmitScoreRequestDto {
  @ApiProperty({ minimum: 0, example: 4500 })
  @IsInt()
  @Min(0)
  score: number;

  @ApiProperty({ minimum: 0, example: 37 })
  @IsInt()
  @Min(0)
  moves: number;

  @ApiProperty({ minimum: 0, example: 95000, description: 'Duration in ms' })
  @IsInt()
  @Min(0)
  elapsedMs: number;

  @ApiPropertyOptional({
    example: 'sort-001',
    description: 'Level of a level-based game; omit for endless games',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  levelId?: string;
}

export class ScoreEntryResponseDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ example: 'hexa-sort' })
  gameId: string;

  @ApiProperty({ type: String, nullable: true, example: 'sort-001' })
  levelId: string | null;

  @ApiProperty({ example: 4500 })
  score: number;

  @ApiProperty({ example: 37 })
  moves: number;

  @ApiProperty({ example: 95000 })
  elapsedMs: number;

  @ApiProperty({ format: 'date-time' })
  createdAt: string;
}

export class LeaderboardQueryDto {
  @ApiPropertyOptional({
    example: 'sort-001',
    description: 'Rank one level; omit for the game-wide leaderboard',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  levelId?: string;
}

export class RankedEntryResponseDto {
  @ApiProperty({ minimum: 1, example: 1 })
  rank: number;

  @ApiProperty({ example: 'Daniel' })
  displayName: string;

  @ApiProperty({ example: 4500 })
  score: number;

  @ApiProperty({ example: 37 })
  moves: number;

  @ApiProperty({ example: 95000 })
  elapsedMs: number;

  @ApiProperty({ format: 'date-time' })
  createdAt: string;
}
