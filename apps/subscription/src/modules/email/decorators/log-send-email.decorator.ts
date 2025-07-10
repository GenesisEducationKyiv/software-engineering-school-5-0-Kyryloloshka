import { Logger } from '@nestjs/common';
import { IEmailService } from '../interfaces/email-service.interface';

export function LogSendEmail() {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const logger = new Logger(target.constructor.name);
    const originalMethod = descriptor.value;
    descriptor.value = async function (this: IEmailService, ...args: any[]) {
      try {
        logger.log(`Calling email ${propertyKey} with args:`, args);
        const result = await originalMethod.apply(this, args);
        return result;
      } catch (error) {
        logger.error(
          `[${propertyKey}] with args: ${JSON.stringify(args)}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
        throw error;
      }
    };
    return descriptor;
  };
}
