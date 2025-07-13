import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { RpcException } from '@nestjs/microservices';
import { ErrorCodes } from '@lib/common';

@Catch(RpcException)
export class GrpcExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GrpcExceptionFilter.name);

  catch(exception: RpcException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();
    const error = exception.getError() as any;

    this.logger.error(
      `gRPC Error: ${error.code || 'UNKNOWN'} - ${error.message}`,
      error.stack,
    );

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    // Map gRPC error codes to HTTP status codes
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

    this.logger.log(
      `HTTP Response: ${status} - ${message} for ${request.method} ${request.url}`,
    );

    response.status(status).json(errorResponse);
  }
}
