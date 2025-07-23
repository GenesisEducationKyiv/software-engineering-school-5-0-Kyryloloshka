import { WeatherResponse } from '@lib/common/types/weather/weather';
import { GetWeatherData } from '@lib/common';

export interface IWeatherService {
  getWeather(data: GetWeatherData): Promise<WeatherResponse>;
}
