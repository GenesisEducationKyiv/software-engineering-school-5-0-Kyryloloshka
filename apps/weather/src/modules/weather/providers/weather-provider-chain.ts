import { GetWeatherDto } from '../../../../../../libs/common/src/types/weather/dto/get-weather.dto';
import { IWeatherProvider } from '../interfaces/weather-provider.interface';
import { WeatherResponse } from '@lib/common/types/weather/weather';

export class WeatherProviderChain implements IWeatherProvider {
  public readonly providerName = 'WeatherProviderChain';

  constructor(private providers: IWeatherProvider[]) {}

  async getWeather({ city }: GetWeatherDto): Promise<WeatherResponse> {
    let lastError: unknown;
    for (const provider of this.providers) {
      try {
        return await provider.getWeather({ city });
      } catch (err: unknown) {
        lastError = err;
      }
    }
    throw lastError;
  }
}
