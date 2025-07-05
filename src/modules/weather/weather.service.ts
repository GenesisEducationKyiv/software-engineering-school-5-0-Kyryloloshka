import { Inject, Injectable } from '@nestjs/common';
import { GetWeatherDto } from './dto/get-weather.dto';
import { WeatherResponse } from '../../common/types/weather';
import { IWeatherProvider } from './interfaces/IWeatherProvider';

@Injectable()
export class WeatherService {
  constructor(
    @Inject('IWeatherProvider')
    private readonly weatherProvider: IWeatherProvider,
  ) {}
  async getWeather({ city }: GetWeatherDto): Promise<WeatherResponse> {
    return this.weatherProvider.getWeather({ city });
  }
}
