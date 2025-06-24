import { WeatherResponse } from 'src/common/types/weather';
import { GetWeatherDto } from '../dto/get-weather.dto';

export interface IWeatherProvider {
  getWeather({ city }: GetWeatherDto): Promise<WeatherResponse>;
}
