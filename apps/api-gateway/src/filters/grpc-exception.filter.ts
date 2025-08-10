import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';
import { Response } from 'express';
import { RpcException } from '@nestjs/microservices';
import { LoggerService, ErrorMapperService } from '@lib/common';

@Catch(RpcException)
export class GrpcExceptionFilter implements ExceptionFilter {
  catch(exception: RpcException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();
    const error = exception.getError() as any;

    LoggerService.error(
      'gRPC Error',
      'GrpcExceptionFilter',
      {
        code: error.code || 'UNKNOWN',
        message: error.message,
        url: request.url,
        method: request.method,
        userAgent: request.headers['user-agent'],
        ip: request.ip,
      },
      new Error(error.message || 'gRPC Error'),
      'GrpcExceptionFilter.catch',
    );

    // Use centralized error mapping instead of switch statement
    const errorMapping = ErrorMapperService.mapErrorCodeToHttp(error.code);
    const status = errorMapping.status;
    const message = error.message || errorMapping.defaultMessage;

    const errorResponse = {
      statusCode: status,
      message,
      error: error.code || 'INTERNAL_ERROR',
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
    };

    LoggerService.log(
      'HTTP Response',
      'GrpcExceptionFilter',
      {
        status,
        message,
        method: request.method,
        url: request.url,
        responseTime: Date.now() - (request._startTime || Date.now()),
      },
      'GrpcExceptionFilter.catch',
    );

    response.status(status).json(errorResponse);
  }
}
