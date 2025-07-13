import { WeatherResponse } from '@lib/common/types/weather/weather';
import { GetWeatherDto } from '../../../../../../libs/common/src/types/weather/dto/get-weather.dto';

export interface IWeatherService {
  getWeather({ city }: GetWeatherDto): Promise<WeatherResponse>;
}
