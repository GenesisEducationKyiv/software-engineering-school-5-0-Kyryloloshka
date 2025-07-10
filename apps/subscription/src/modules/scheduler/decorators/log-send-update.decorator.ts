import { Logger } from '@nestjs/common';
import { LoggedError } from '@lib/common/errors/logged.error';

export function LogSendUpdate() {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;
    descriptor.value = async function (...args: any[]) {
      const logger = new Logger(target.constructor.name);
      try {
        return await originalMethod.apply(this, args);
      } catch (error) {
        if (error instanceof LoggedError) {
          switch (error.type) {
            case 'log':
              logger.log(`Calling scheduler ${propertyKey}: ${error.message}`);
              break;
            case 'warn':
              logger.warn(`Calling scheduler ${propertyKey}: ${error.message}`);
              break;
            case 'error':
              logger.error(
                `Calling scheduler ${propertyKey}: ${error.message}`,
                error,
              );
              break;
            default:
              logger.error(
                `Unknown log type in ${propertyKey}: ${error.message}`,
                error,
              );
          }
        } else {
          logger.error(
            `${propertyKey}: ${error instanceof Error ? error.message : 'Unknown error'}`,
            error,
          );
        }
      }
    };
    return descriptor;
  };
}
