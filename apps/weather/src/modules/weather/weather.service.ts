import { Inject, Injectable } from '@nestjs/common';
import { IWeatherProvider } from './interfaces/weather-provider.interface';
import { IWeatherService } from './interfaces/weather-service.interface';
import { GetWeatherData, WeatherResponse } from '@lib/common';

@Injectable()
export class WeatherService implements IWeatherService {
  constructor(
    @Inject('IWeatherProvider')
    private readonly weatherProvider: IWeatherProvider,
  ) {}

  async getWeather(data: GetWeatherData): Promise<WeatherResponse> {
    return this.weatherProvider.getWeather(data);
  }
}
