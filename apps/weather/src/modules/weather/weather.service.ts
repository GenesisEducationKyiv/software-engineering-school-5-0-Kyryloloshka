import { Inject, Injectable } from '@nestjs/common';
import { GetWeatherDto } from './dto/get-weather.dto';
import { IWeatherProvider } from './interfaces/weather-provider.interface';
import { IWeatherService } from './interfaces/weather-service.interface';
import { WeatherResponse } from '@lib/common/types/weather';

@Injectable()
export class WeatherService implements IWeatherService {
  constructor(
    @Inject('IWeatherProvider')
    private readonly weatherProvider: IWeatherProvider,
  ) {}

  async getWeather({ city }: GetWeatherDto): Promise<WeatherResponse> {
    return this.weatherProvider.getWeather({ city });
  }
}
