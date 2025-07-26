import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { RpcException } from '@nestjs/microservices';
import { LoggerService } from '@lib/common';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    LoggerService.error(
      'Unhandled Exception',
      'AllExceptionsFilter',
      {
        url: request.url,
        method: request.method,
        userAgent: request.headers['user-agent'],
        ip: request.ip,
      },
      exception instanceof Error ? exception : new Error(String(exception)),
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
          LoggerService.debug(
            'No regex match found, using full string as message',
            'AllExceptionsFilter',
            { rpcError },
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

    LoggerService.log('HTTP Response', 'AllExceptionsFilter', {
      status,
      message,
      method: request.method,
      url: request.url,
      responseTime: Date.now() - (request._startTime || Date.now()),
    });

    response.status(status).json(errorResponse);
  }
}
