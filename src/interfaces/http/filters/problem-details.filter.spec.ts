import {
  type ArgumentsHost,
  BadRequestException,
  Logger,
  NotImplementedException,
} from '@nestjs/common';
import { PROBLEM_JSON, ProblemDetailsFilter } from './problem-details.filter';

function createHost(path: string) {
  const response = {
    status: jest.fn().mockReturnThis(),
    type: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
  const host = {
    switchToHttp: () => ({
      getRequest: () => ({ path }),
      getResponse: () => response,
    }),
  } as unknown as ArgumentsHost;
  return { host, response };
}

describe('ProblemDetailsFilter', () => {
  const filter = new ProblemDetailsFilter();

  it('should_write_problem_json_when_an_http_exception_is_thrown', () => {
    // Arrange
    const { host, response } = createHost('/me');

    // Act
    filter.catch(new NotImplementedException(), host);

    // Assert
    expect(response.status).toHaveBeenCalledWith(501);
    expect(response.type).toHaveBeenCalledWith(PROBLEM_JSON);
    expect(response.json).toHaveBeenCalledWith({
      type: 'about:blank',
      title: 'Not Implemented',
      status: 501,
      detail: 'Not Implemented',
      instance: '/me',
    });
  });

  it('should_join_messages_in_detail_when_validation_returns_several', () => {
    // Arrange
    const { host, response } = createHost('/auth/login');
    const exception = new BadRequestException([
      'email must be an email',
      'password should not be empty',
    ]);

    // Act
    filter.catch(exception, host);

    // Assert
    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 400,
        detail: 'email must be an email; password should not be empty',
      }),
    );
  });

  it('should_not_echo_the_body_when_json_is_malformed', () => {
    // Arrange: how the Express adapter wraps a body-parser SyntaxError
    const { host, response } = createHost('/auth/login');
    const cause = new SyntaxError('Unexpected token, "{"password": hunter2"');
    const exception = new BadRequestException(cause.message, { cause });

    // Act
    filter.catch(exception, host);

    // Assert
    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 400,
        detail: 'Request body is not valid JSON.',
      }),
    );
  });

  it('should_hide_internal_details_when_an_unknown_error_is_thrown', () => {
    // Arrange
    const { host, response } = createHost('/progress/hexa-sort');
    const logSpy = jest
      .spyOn(Logger.prototype, 'error')
      .mockImplementation(() => undefined);

    // Act
    filter.catch(new Error('connection to db-internal:5432 refused'), host);

    // Assert
    expect(response.status).toHaveBeenCalledWith(500);
    expect(response.json).toHaveBeenCalledWith({
      type: 'about:blank',
      title: 'Internal Server Error',
      status: 500,
      detail: 'An unexpected error occurred.',
      instance: '/progress/hexa-sort',
    });
    logSpy.mockRestore();
  });
});
