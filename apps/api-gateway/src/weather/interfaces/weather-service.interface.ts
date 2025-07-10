import { GetWeatherDto } from 'apps/weather/src/modules/weather/dto/get-weather.dto';

export interface IWeatherService {
  getWeather({ city }: GetWeatherDto): Promise<any>;
}
