import { LoggerService } from '@lib/common';
import { ISubscriptionService } from '../interfaces/subscription-service.interface';

export function LogSubscription() {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;
    descriptor.value = async function (
      this: ISubscriptionService,
      ...args: any[]
    ) {
      const startTime = Date.now();

      try {
        LoggerService.log(`Calling ${propertyKey}`, target.constructor.name, {
          args,
          method: propertyKey,
        });

        const result = await originalMethod.apply(this, args);
        const duration = Date.now() - startTime;

        LoggerService.log(`Completed ${propertyKey}`, target.constructor.name, {
          result,
          method: propertyKey,
          duration,
        });

        return result;
      } catch (error) {
        const duration = Date.now() - startTime;

        LoggerService.error(
          `Error in ${propertyKey}`,
          target.constructor.name,
          { args, method: propertyKey, duration },
          error instanceof Error ? error : new Error(String(error)),
        );

        throw error;
      }
    };
    return descriptor;
  };
}
