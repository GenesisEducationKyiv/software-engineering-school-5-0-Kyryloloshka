export interface GrpcError {
  code: string;
  message: string;
  details?: string;
}

export enum ErrorCodes {
  // Weather errors
  CITY_NOT_FOUND = 'CITY_NOT_FOUND',
  WEATHER_API_ERROR = 'WEATHER_API_ERROR',
  WEATHER_PROVIDER_ERROR = 'WEATHER_PROVIDER_ERROR',

  // Subscription errors
  EMAIL_ALREADY_SUBSCRIBED = 'EMAIL_ALREADY_SUBSCRIBED',
  INVALID_TOKEN = 'INVALID_TOKEN',
  SUBSCRIPTION_NOT_FOUND = 'SUBSCRIPTION_NOT_FOUND',
  WEATHER_UNAVAILABLE = 'WEATHER_UNAVAILABLE',

  // General errors
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  BAD_REQUEST = 'BAD_REQUEST',
}

export const HTTP_TO_GRPC_ERROR_MAP = {
  NotFoundException: ErrorCodes.CITY_NOT_FOUND,
  ConflictException: ErrorCodes.EMAIL_ALREADY_SUBSCRIBED,
  BadRequestException: ErrorCodes.BAD_REQUEST,
  InternalServerErrorException: ErrorCodes.INTERNAL_ERROR,
  ValidationException: ErrorCodes.VALIDATION_ERROR,
} as const;
