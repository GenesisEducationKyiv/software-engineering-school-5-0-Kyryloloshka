import { Observable } from 'rxjs';
import { GetWeatherDto } from './dto/get-weather.dto';

export interface WeatherResponse {
  temperature: number;
  humidity: number;
  description: string;
}

export interface WeatherServiceClient {
  getWeather(request: GetWeatherDto): Observable<WeatherResponse>;
}

export const WEATHER_SERVICE_NAME = 'WeatherService';
export const WEATHER_PACKAGE_NAME = 'weather';
