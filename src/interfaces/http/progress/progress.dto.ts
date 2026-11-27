import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

const GAME_DATA_DESCRIPTION =
  "Game-specific progress data, merged by the game's IProgressMergePolicy";

export class LevelProgressDto {
  @ApiProperty({ example: 'sort-001' })
  @IsString()
  @IsNotEmpty()
  levelId: string;

  @ApiProperty({ minimum: 0, example: 1200 })
  @IsInt()
  @Min(0)
  bestScore: number;

  @ApiPropertyOptional({
    type: String,
    format: 'date-time',
    nullable: true,
    description: 'When the level was first completed; absent if not completed',
  })
  @IsOptional()
  @IsDateString()
  completedAt?: string | null;

  @ApiPropertyOptional({
    type: 'object',
    additionalProperties: true,
    description: 'Level-specific data of the game',
  })
  @IsOptional()
  @IsObject()
  data?: Record<string, unknown>;
}

export class SyncProgressRequestDto {
  @ApiProperty({ minimum: 0, example: 4500 })
  @IsInt()
  @Min(0)
  bestScore: number;

  @ApiPropertyOptional({
    type: 'object',
    additionalProperties: true,
    description: GAME_DATA_DESCRIPTION,
  })
  @IsOptional()
  @IsObject()
  data?: Record<string, unknown>;

  @ApiPropertyOptional({
    type: [LevelProgressDto],
    description: 'Per-level progress; only level-based games send it',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LevelProgressDto)
  levels?: LevelProgressDto[];
}

export class GameProgressResponseDto {
  @ApiProperty({ example: 'hexa-sort' })
  gameId: string;

  @ApiProperty({ minimum: 0, example: 4500 })
  bestScore: number;

  @ApiProperty({
    type: 'object',
    additionalProperties: true,
    description: GAME_DATA_DESCRIPTION,
  })
  data: Record<string, unknown>;

  @ApiProperty({ type: [LevelProgressDto] })
  levels: LevelProgressDto[];

  @ApiProperty({ format: 'date-time' })
  updatedAt: string;
}
