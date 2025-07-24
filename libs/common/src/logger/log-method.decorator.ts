import { LoggerService } from './logger.service';

export function LogMethod(options?: {
  context?: string;
  level?: 'log' | 'warn' | 'error' | 'debug' | 'info';
}) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;
    descriptor.value = async function (...args: any[]) {
      const context = options?.context || target.constructor.name;
      const level = options?.level || 'log';
      try {
        LoggerService[level](
          `[${context}] Calling ${propertyKey} with args: %j`,
          args,
        );
        const result = await originalMethod.apply(this, args);
        LoggerService[level](
          `[${context}] Result from ${propertyKey}: %j`,
          result,
        );
        return result;
      } catch (error) {
        LoggerService.error(
          `[${context}] Error in ${propertyKey} with args: %j: %s`,
          args,
          error instanceof Error ? error.message : 'Unknown error',
        );
        throw error;
      }
    };
    return descriptor;
  };
}
