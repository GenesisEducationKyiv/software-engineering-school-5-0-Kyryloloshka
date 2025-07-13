import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { RpcException } from '@nestjs/microservices';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    this.logger.error(
      `Unhandled Exception: ${exception instanceof Error ? exception.message : 'Unknown error'}`,
      exception instanceof Error ? exception.stack : undefined,
    );

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errorCode = 'INTERNAL_ERROR';

    if (exception instanceof RpcException) {
      const rpcError = exception.getError() as any;

      if (rpcError && typeof rpcError === 'object' && rpcError.code) {
        errorCode = rpcError.code;
        message = rpcError.message || 'RPC Error';
        switch (rpcError.code) {
          case 5: // NOT_FOUND
            status = HttpStatus.NOT_FOUND;
            break;
          case 6: // ALREADY_EXISTS
            status = HttpStatus.CONFLICT;
            break;
          case 3: // INVALID_ARGUMENT
            status = HttpStatus.BAD_REQUEST;
            break;
          case 14: // UNAVAILABLE
            status = HttpStatus.SERVICE_UNAVAILABLE;
            break;
          case 13: // INTERNAL
            status = HttpStatus.INTERNAL_SERVER_ERROR;
            break;
          default:
            status = HttpStatus.INTERNAL_SERVER_ERROR;
        }
      } else if (typeof rpcError === 'string') {
        let errorMessage = rpcError;
        let codeFromMessage = '';

        let match = errorMessage.match(/([A-Z_]+):\s*([^:]+)$/);
        if (!match) {
          match = errorMessage.match(/([A-Z_]+):\s*(.+)/);
        }

        if (match) {
          codeFromMessage = match[1];
          errorMessage = match[2];
        } else {
          this.logger.debug(
            `No regex match found, using full string as message`,
          );
        }

        message = errorMessage;
        errorCode = codeFromMessage || 'INTERNAL_ERROR';
        switch (errorCode) {
          case 'CITY_NOT_FOUND':
            status = HttpStatus.NOT_FOUND;
            break;
          case 'EMAIL_ALREADY_SUBSCRIBED':
            status = HttpStatus.CONFLICT;
            break;
          case 'INVALID_TOKEN':
          case 'SUBSCRIPTION_NOT_FOUND':
            status = HttpStatus.NOT_FOUND;
            break;
          case 'WEATHER_UNAVAILABLE':
          case 'BAD_REQUEST':
            status = HttpStatus.BAD_REQUEST;
            break;
          case 'VALIDATION_ERROR':
            status = HttpStatus.BAD_REQUEST;
            break;
          case 'WEATHER_API_ERROR':
          case 'WEATHER_PROVIDER_ERROR':
            status = HttpStatus.SERVICE_UNAVAILABLE;
            break;
          default:
            status = HttpStatus.INTERNAL_SERVER_ERROR;
        }
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      errorCode = exception.name;
    }

    const errorResponse = {
      statusCode: status,
      message,
      error: errorCode,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
    };

    this.logger.log(
      `HTTP Response: ${status} - ${message} for ${request.method} ${request.url}`,
    );

    response.status(status).json(errorResponse);
  }
}
