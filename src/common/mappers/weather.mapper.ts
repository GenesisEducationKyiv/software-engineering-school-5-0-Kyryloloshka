import { WeatherResponse } from '../types/weather';

export const mapToWeatherResponse = (data: any): WeatherResponse => ({
  temperature: data.current.temp_c,
  humidity: data.current.humidity,
  description: data.current.condition.text,
});
