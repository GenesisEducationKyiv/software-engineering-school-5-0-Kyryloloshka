import { Logger } from '@nestjs/common';
import { LoggedError } from 'src/common/errors/logged.error';

export function LogSubscription() {
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
              logger.log(
                `Called ${propertyKey} with args: ${JSON.stringify(args)}: ${error.message}`,
              );
              break;
            case 'warn':
              logger.warn(
                `Called ${propertyKey} with args: ${JSON.stringify(args)}: ${error.message}`,
              );
              break;
            case 'error':
              logger.error(
                `Called ${propertyKey} with args: ${JSON.stringify(args)}: ${error.message}`,
                error,
              );
              break;
            default:
              logger.error(
                `Unknown log type in ${propertyKey} with params ${JSON.stringify(args)}: ${error.message}`,
                error,
              );
          }
        } else {
          logger.error(
            `Called ${propertyKey} with args: ${JSON.stringify(args)}: ${error instanceof Error ? error.message : 'Unknown error'}`,
            error,
          );
        }
        throw error;
      }
    };
    return descriptor;
  };
}
