import { ApiProperty } from '@nestjs/swagger';

/** RFC 9457 problem details body returned for every error. */
export class ProblemDetailsDto {
  @ApiProperty({
    example: 'about:blank',
    description: 'URI reference identifying the problem type',
  })
  type: string;

  @ApiProperty({
    example: 'Bad Request',
    description: 'Short summary of the problem type',
  })
  title: string;

  @ApiProperty({ example: 400, description: 'HTTP status code' })
  status: number;

  @ApiProperty({
    example: 'gameId must be one of: hexa-lines, hexa-sort, hexa-merge',
    description: 'Explanation specific to this occurrence',
  })
  detail: string;

  @ApiProperty({
    example: '/progress/hexa-unknown',
    description: 'Request path of this occurrence',
  })
  instance: string;
}
