import { GetWeatherData } from '@lib/common';
import { IWeatherProvider } from '../interfaces/weather-provider.interface';
import { WeatherResponse } from '@lib/common/types/weather/weather';

export class WeatherProviderChain implements IWeatherProvider {
  public readonly providerName = 'WeatherProviderChain';

  constructor(private providers: IWeatherProvider[]) {}

  async getWeather(data: GetWeatherData): Promise<WeatherResponse> {
    let lastError: unknown;
    for (const provider of this.providers) {
      try {
        return await provider.getWeather(data);
      } catch (err: unknown) {
        lastError = err;
      }
    }
    throw lastError;
  }
}
