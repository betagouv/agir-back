import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { Response } from 'express';
import { ApplicationError } from '../applicationError';

@Catch(ApplicationError)
export class ControllerExceptionFilter implements ExceptionFilter {
  catch(exception: ApplicationError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    response.status(exception.http_status).json({
      statusCode: exception.http_status,
      code: exception.code,
      message: exception.message,
    });
  }
}
