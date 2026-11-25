import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { STATUS_CODES } from 'node:http';
import type { ProblemDetailsDto } from './problem-details.dto';

export const PROBLEM_JSON = 'application/problem+json';

/** Translates every exception into an RFC 9457 `application/problem+json` response. */
@Catch()
export class ProblemDetailsFilter implements ExceptionFilter {
  private readonly logger = new Logger(ProblemDetailsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const http = host.switchToHttp();
    const request = http.getRequest<Request>();
    const response = http.getResponse<Response>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    const title = STATUS_CODES[status] ?? 'Error';

    if (!(exception instanceof HttpException)) {
      // Unexpected failures stay in the server log; the client gets a generic detail.
      this.logger.error(
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    const body: ProblemDetailsDto = {
      type: 'about:blank',
      title,
      status,
      detail:
        exception instanceof HttpException
          ? this.detailOf(exception, title)
          : 'An unexpected error occurred.',
      instance: request.path,
    };

    response.status(status).type(PROBLEM_JSON).json(body);
  }

  /** Nest exceptions carry a string or `{ message: string | string[] }`. */
  private detailOf(exception: HttpException, fallback: string): string {
    // Parser messages quote the raw body or path, which must not be echoed back.
    if (exception.cause instanceof SyntaxError) {
      return 'Request body is not valid JSON.';
    }
    if (exception.cause instanceof URIError) {
      return 'Request path is not correctly encoded.';
    }
    const payload = exception.getResponse();
    if (typeof payload === 'string') {
      return payload;
    }
    const message = (payload as { message?: unknown }).message;
    if (Array.isArray(message)) {
      return message.map(String).join('; ');
    }
    return typeof message === 'string' ? message : fallback;
  }
}
