import { GetWeatherDto } from '@lib/common/types/weather/dto/get-weather.dto';

export interface IWeatherService {
  getWeather({ city }: GetWeatherDto): Promise<any>;
}
