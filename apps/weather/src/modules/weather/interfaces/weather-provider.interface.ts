import { WeatherResponse } from '@lib/common/types/weather';
import { GetWeatherDto } from '../dto/get-weather.dto';

export interface IWeatherProvider {
  providerName: string;
  getWeather({ city }: GetWeatherDto): Promise<WeatherResponse>;
}
