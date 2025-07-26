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
      const startTime = Date.now();

      try {
        LoggerService[level](`Calling ${propertyKey}`, context, {
          args,
          method: propertyKey,
        });

        const result = await originalMethod.apply(this, args);
        const duration = Date.now() - startTime;

        LoggerService[level](`Completed ${propertyKey}`, context, {
          result,
          method: propertyKey,
          duration,
        });

        return result;
      } catch (error) {
        const duration = Date.now() - startTime;

        LoggerService.error(
          `Error in ${propertyKey}`,
          context,
          { args, method: propertyKey, duration },
          error instanceof Error ? error : new Error(String(error)),
        );

        throw error;
      }
    };
    return descriptor;
  };
}
