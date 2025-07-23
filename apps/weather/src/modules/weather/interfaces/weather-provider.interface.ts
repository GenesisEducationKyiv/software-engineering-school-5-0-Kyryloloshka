import { WeatherResponse } from '@lib/common/types/weather/weather';
import { GetWeatherData } from '@lib/common';

export interface IWeatherProvider {
  providerName: string;
  getWeather(data: GetWeatherData): Promise<WeatherResponse>;
}
