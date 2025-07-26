import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { RpcException } from '@nestjs/microservices';
import { ErrorCodes, LoggerService } from '@lib/common';

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
    );

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    switch (error.code) {
      case ErrorCodes.CITY_NOT_FOUND:
        status = HttpStatus.NOT_FOUND;
        message = error.message || 'City not found';
        break;
      case ErrorCodes.EMAIL_ALREADY_SUBSCRIBED:
        status = HttpStatus.CONFLICT;
        message = error.message || 'Email already subscribed';
        break;
      case ErrorCodes.INVALID_TOKEN:
      case ErrorCodes.SUBSCRIPTION_NOT_FOUND:
        status = HttpStatus.NOT_FOUND;
        message = error.message || 'Invalid or expired token';
        break;
      case ErrorCodes.WEATHER_UNAVAILABLE:
      case ErrorCodes.BAD_REQUEST:
        status = HttpStatus.BAD_REQUEST;
        message = error.message || 'Bad request';
        break;
      case ErrorCodes.VALIDATION_ERROR:
        status = HttpStatus.BAD_REQUEST;
        message = error.message || 'Validation error';
        break;
      case ErrorCodes.WEATHER_API_ERROR:
      case ErrorCodes.WEATHER_PROVIDER_ERROR:
        status = HttpStatus.SERVICE_UNAVAILABLE;
        message = error.message || 'Weather service temporarily unavailable';
        break;
      case ErrorCodes.INTERNAL_ERROR:
      default:
        status = HttpStatus.INTERNAL_SERVER_ERROR;
        message = error.message || 'Internal server error';
        break;
    }

    const errorResponse = {
      statusCode: status,
      message,
      error: error.code || 'INTERNAL_ERROR',
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
    };

    LoggerService.log('HTTP Response', 'GrpcExceptionFilter', {
      status,
      message,
      method: request.method,
      url: request.url,
      responseTime: Date.now() - (request._startTime || Date.now()),
    });

    response.status(status).json(errorResponse);
  }
}
