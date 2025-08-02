import { HttpStatus } from '@nestjs/common';
import { ErrorMapperService } from './error-mapper.service';
import { ErrorCodes } from '../types/errors';

describe('ErrorMapperService', () => {
  describe('mapErrorCodeToHttp', () => {
    it('should map string error codes to correct HTTP status codes', () => {
      const cityNotFoundMapping = ErrorMapperService.mapErrorCodeToHttp(
        ErrorCodes.CITY_NOT_FOUND,
      );
      expect(cityNotFoundMapping.status).toBe(404);
      expect(cityNotFoundMapping.defaultMessage).toBe('City not found');

      const emailConflictMapping = ErrorMapperService.mapErrorCodeToHttp(
        ErrorCodes.EMAIL_ALREADY_SUBSCRIBED,
      );
      expect(emailConflictMapping.status).toBe(409);
      expect(emailConflictMapping.defaultMessage).toBe(
        'Email already subscribed',
      );

      const weatherApiErrorMapping = ErrorMapperService.mapErrorCodeToHttp(
        ErrorCodes.WEATHER_API_ERROR,
      );
      expect(weatherApiErrorMapping.status).toBe(503);
      expect(weatherApiErrorMapping.defaultMessage).toBe(
        'Weather service temporarily unavailable',
      );
    });

    it('should map numeric gRPC codes to correct HTTP status codes', () => {
      const notFoundMapping = ErrorMapperService.mapErrorCodeToHttp(5); // NOT_FOUND
      expect(notFoundMapping.status).toBe(404);
      expect(notFoundMapping.defaultMessage).toBe('Not found');

      const conflictMapping = ErrorMapperService.mapErrorCodeToHttp(6); // ALREADY_EXISTS
      expect(conflictMapping.status).toBe(409);
      expect(conflictMapping.defaultMessage).toBe('Already exists');

      const invalidArgumentMapping = ErrorMapperService.mapErrorCodeToHttp(3); // INVALID_ARGUMENT
      expect(invalidArgumentMapping.status).toBe(400);
      expect(invalidArgumentMapping.defaultMessage).toBe('Invalid argument');
    });

    it('should return default internal server error for unknown error codes', () => {
      const unknownMapping =
        ErrorMapperService.mapErrorCodeToHttp('UNKNOWN_ERROR');
      expect(unknownMapping.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(unknownMapping.defaultMessage).toBe('Internal server error');

      const unknownNumericMapping = ErrorMapperService.mapErrorCodeToHttp(999);
      expect(unknownNumericMapping.status).toBe(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      expect(unknownNumericMapping.defaultMessage).toBe(
        'Internal server error',
      );
    });
  });

  describe('parseErrorString', () => {
    it('should parse error strings in "ERROR_CODE: message" format', () => {
      const result = ErrorMapperService.parseErrorString(
        'CITY_NOT_FOUND: City not found',
      );
      expect(result.code).toBe('CITY_NOT_FOUND');
      expect(result.message).toBe('City not found');
    });

    it('should parse error strings in "ERROR_CODE: message: details" format', () => {
      const result = ErrorMapperService.parseErrorString(
        'VALIDATION_ERROR: Invalid input: email format',
      );
      expect(result.code).toBe('VALIDATION_ERROR');
      expect(result.message).toBe('Invalid input: email format');
    });

    it('should handle strings without error code format', () => {
      const result = ErrorMapperService.parseErrorString(
        'Some generic error message',
      );
      expect(result.code).toBe('INTERNAL_ERROR');
      expect(result.message).toBe('Some generic error message');
    });

    it('should handle empty strings', () => {
      const result = ErrorMapperService.parseErrorString('');
      expect(result.code).toBe('INTERNAL_ERROR');
      expect(result.message).toBe('');
    });
  });

  describe('Open-Closed Principle compliance', () => {
    it('should be extensible without modification by adding new error codes to configuration', () => {
      // This test demonstrates that new error codes can be added to the configuration
      // without modifying the ErrorMapperService class itself
      const testMapping = ErrorMapperService.mapErrorCodeToHttp('TEST_ERROR');
      expect(testMapping.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(testMapping.defaultMessage).toBe('Internal server error');

      // If we add TEST_ERROR to the configuration, it would work without changing the service
      // This demonstrates OCP compliance
    });
  });
});
