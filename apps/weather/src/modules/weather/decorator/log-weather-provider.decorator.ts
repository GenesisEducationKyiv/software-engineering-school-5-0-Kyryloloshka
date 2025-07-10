import { Logger } from '@nestjs/common';
import { IWeatherProvider } from '../interfaces/weather-provider.interface';

export function LogWeatherProvider() {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const logger = new Logger(target.constructor.name);
    const originalMethod = descriptor.value;
    descriptor.value = async function (this: IWeatherProvider, ...args: any[]) {
      const providerName = this.providerName || target.constructor.name;
      try {
        logger.log(`[${providerName}] Calling ${propertyKey} with args:`, args);
        const result = await originalMethod.apply(this, args);
        return result;
      } catch (error) {
        logger.error(
          `Error in [${providerName}] ${propertyKey} with args: ${JSON.stringify(args)}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
        throw error;
      }
    };
    return descriptor;
  };
}
