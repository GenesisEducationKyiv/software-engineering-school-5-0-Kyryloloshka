import { GetWeatherDto } from '../dto/get-weather.dto';
import { IWeatherProvider } from '../interfaces/IWeatherProvider';
import { WeatherResponse } from 'src/common/types/weather';

export class WeatherProviderChain implements IWeatherProvider {
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
