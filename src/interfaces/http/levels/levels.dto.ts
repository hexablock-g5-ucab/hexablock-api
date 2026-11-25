import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export const LEVEL_DIFFICULTIES = ['easy', 'medium', 'hard'] as const;

const BOARD_DESCRIPTION =
  'Board shape, e.g. { "shape": "hexagon", "radius": 3 } (schemas/level.schema.json)';
const SPEC_DESCRIPTION =
  "Game-specific section, validated by the game's ILevelSpecValidator";

/**
 * Level envelope the admin publishes. gameId and levelId come from the path;
 * they may also appear in the body so a level read back can be sent unchanged.
 */
export class UpsertLevelRequestDto {
  @ApiPropertyOptional({
    example: 'hexa-sort',
    description: 'Optional; must equal the gameId in the path',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  gameId?: string;

  @ApiPropertyOptional({
    example: 'sort-001',
    description: 'Optional; must equal the levelId in the path',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  levelId?: string;

  @ApiProperty({ minimum: 1, example: 1, description: 'Wire format version' })
  @IsInt()
  @Min(1)
  schemaVersion: number;

  @ApiProperty({ minimum: 1, example: 1, description: 'Position in the list' })
  @IsInt()
  @Min(1)
  order: number;

  @ApiPropertyOptional({ enum: LEVEL_DIFFICULTIES })
  @IsOptional()
  @IsIn(LEVEL_DIFFICULTIES)
  difficulty?: (typeof LEVEL_DIFFICULTIES)[number];

  @ApiProperty({
    type: 'object',
    additionalProperties: true,
    description: BOARD_DESCRIPTION,
  })
  @IsObject()
  board: Record<string, unknown>;

  @ApiProperty({
    type: 'object',
    additionalProperties: true,
    description: SPEC_DESCRIPTION,
  })
  @IsObject()
  spec: Record<string, unknown>;
}

export class LevelDefinitionResponseDto {
  @ApiProperty({ example: 'hexa-sort' })
  gameId: string;

  @ApiProperty({ example: 'sort-001' })
  levelId: string;

  @ApiProperty({ example: 1, description: 'Wire format version' })
  schemaVersion: number;

  @ApiProperty({
    example: 1,
    description: 'Content revision, managed by the server',
  })
  version: number;

  @ApiProperty({ example: 1 })
  order: number;

  @ApiPropertyOptional({ enum: LEVEL_DIFFICULTIES })
  difficulty?: (typeof LEVEL_DIFFICULTIES)[number];

  @ApiProperty({
    type: 'object',
    additionalProperties: true,
    description: BOARD_DESCRIPTION,
  })
  board: Record<string, unknown>;

  @ApiProperty({
    type: 'object',
    additionalProperties: true,
    description: SPEC_DESCRIPTION,
  })
  spec: Record<string, unknown>;
}
