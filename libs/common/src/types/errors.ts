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

// Centralized error mapping configuration following OCP
export interface ErrorMapping {
  status: number;
  defaultMessage: string;
}

export const ERROR_CODE_TO_HTTP_MAP: Record<string, ErrorMapping> = {
  // Weather errors
  [ErrorCodes.CITY_NOT_FOUND]: {
    status: 404,
    defaultMessage: 'City not found',
  },
  [ErrorCodes.WEATHER_API_ERROR]: {
    status: 503,
    defaultMessage: 'Weather service temporarily unavailable',
  },
  [ErrorCodes.WEATHER_PROVIDER_ERROR]: {
    status: 503,
    defaultMessage: 'Weather service temporarily unavailable',
  },

  // Subscription errors
  [ErrorCodes.EMAIL_ALREADY_SUBSCRIBED]: {
    status: 409,
    defaultMessage: 'Email already subscribed',
  },
  [ErrorCodes.INVALID_TOKEN]: {
    status: 404,
    defaultMessage: 'Invalid or expired token',
  },
  [ErrorCodes.SUBSCRIPTION_NOT_FOUND]: {
    status: 404,
    defaultMessage: 'Invalid or expired token',
  },
  [ErrorCodes.WEATHER_UNAVAILABLE]: {
    status: 400,
    defaultMessage: 'Bad request',
  },

  // General errors
  [ErrorCodes.VALIDATION_ERROR]: {
    status: 400,
    defaultMessage: 'Validation error',
  },
  [ErrorCodes.BAD_REQUEST]: {
    status: 400,
    defaultMessage: 'Bad request',
  },
  [ErrorCodes.INTERNAL_ERROR]: {
    status: 500,
    defaultMessage: 'Internal server error',
  },
} as const;

// gRPC numeric codes mapping
export const GRPC_CODE_TO_HTTP_MAP: Record<number, ErrorMapping> = {
  3: { status: 400, defaultMessage: 'Invalid argument' }, // INVALID_ARGUMENT
  5: { status: 404, defaultMessage: 'Not found' }, // NOT_FOUND
  6: { status: 409, defaultMessage: 'Already exists' }, // ALREADY_EXISTS
  13: { status: 500, defaultMessage: 'Internal error' }, // INTERNAL
  14: { status: 503, defaultMessage: 'Service unavailable' }, // UNAVAILABLE
} as const;
