import { applyDecorators } from '@nestjs/common';
import { ApiExtraModels, ApiResponse, getSchemaPath } from '@nestjs/swagger';
import { ProblemDetailsDto } from './problem-details.dto';
import { PROBLEM_JSON } from './problem-details.filter';

const DESCRIPTIONS: Record<number, string> = {
  400: 'Invalid gameId, path parameter or body',
  401: 'Missing, invalid or expired bearer token',
  403: 'Authenticated user lacks the required role',
  409: 'Resource already exists',
  501: 'Declared in the API contract but not implemented yet',
};

/** Documents each error status as an RFC 9457 `application/problem+json` response. */
export const ApiProblemResponses = (...statuses: number[]) =>
  applyDecorators(
    ApiExtraModels(ProblemDetailsDto),
    ...statuses.map((status) =>
      ApiResponse({
        status,
        description: DESCRIPTIONS[status] ?? 'Error',
        content: {
          [PROBLEM_JSON]: {
            schema: { $ref: getSchemaPath(ProblemDetailsDto) },
          },
        },
      }),
    ),
  );
