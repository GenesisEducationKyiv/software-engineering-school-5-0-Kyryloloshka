import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { RpcException } from '@nestjs/microservices';
import { LoggerService, ErrorMapperService } from '@lib/common';

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
      'AllExceptionsFilter.catch',
    );

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errorCode = 'INTERNAL_ERROR';

    if (exception instanceof RpcException) {
      const rpcError = exception.getError() as any;

      if (rpcError && typeof rpcError === 'object' && rpcError.code) {
        errorCode = rpcError.code;
        message = rpcError.message || 'RPC Error';

        const errorMapping = ErrorMapperService.mapErrorCodeToHttp(
          rpcError.code,
        );
        status = errorMapping.status;
        message = rpcError.message || errorMapping.defaultMessage;
      } else if (typeof rpcError === 'string') {
        const parsedError = ErrorMapperService.parseErrorString(rpcError);
        errorCode = parsedError.code;
        message = parsedError.message;

        const errorMapping = ErrorMapperService.mapErrorCodeToHttp(errorCode);
        status = errorMapping.status;
        message = parsedError.message || errorMapping.defaultMessage;
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

    LoggerService.log(
      'HTTP Response',
      'AllExceptionsFilter',
      {
        status,
        message,
        method: request.method,
        url: request.url,
        responseTime: Date.now() - (request._startTime || Date.now()),
      },
      'AllExceptionsFilter.catch',
    );

    response.status(status).json(errorResponse);
  }
}
