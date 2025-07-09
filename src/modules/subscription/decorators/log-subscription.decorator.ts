import { Logger } from '@nestjs/common';
import { ISubscriptionService } from '../interfaces/subscription-service.interface';

export function LogSubscription() {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const logger = new Logger(target.constructor.name);
    const originalMethod = descriptor.value;
    descriptor.value = async function (
      this: ISubscriptionService,
      ...args: any[]
    ) {
      try {
        logger.log(`Calling ${propertyKey} with args:`, args);
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
