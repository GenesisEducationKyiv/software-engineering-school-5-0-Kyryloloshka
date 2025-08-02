import { HttpStatus } from '@nestjs/common';
import {
  ERROR_CODE_TO_HTTP_MAP,
  GRPC_CODE_TO_HTTP_MAP,
  ErrorMapping,
} from '../types/errors';

export class ErrorMapperService {
  /**
   * Maps error codes to HTTP status codes and default messages
   * Follows OCP by using configuration-based mapping
   */
  static mapErrorCodeToHttp(errorCode: string | number): ErrorMapping {
    // Handle numeric gRPC codes
    if (typeof errorCode === 'number') {
      return (
        GRPC_CODE_TO_HTTP_MAP[errorCode] || {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          defaultMessage: 'Internal server error',
        }
      );
    }

    // Handle string error codes
    return (
      ERROR_CODE_TO_HTTP_MAP[errorCode] || {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        defaultMessage: 'Internal server error',
      }
    );
  }

  /**
   * Extracts error code and message from string error messages
   * Handles formats like "ERROR_CODE: message" or "ERROR_CODE: message: details"
   */
  static parseErrorString(errorString: string): {
    code: string;
    message: string;
  } {
    // Try to match "ERROR_CODE: message" format
    let match = errorString.match(/^([A-Z_]+):\s*([^:]+)$/);

    if (!match) {
      // Try to match "ERROR_CODE: message: details" format
      match = errorString.match(/^([A-Z_]+):\s*(.+)/);
    }

    if (match) {
      return {
        code: match[1],
        message: match[2].trim(),
      };
    }

    // If no pattern matches, treat the entire string as message
    return {
      code: 'INTERNAL_ERROR',
      message: errorString,
    };
  }
}
