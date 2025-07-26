export * from './dto/get-weather.dto';
export * from './weather';

// Domain types for provider interfaces
export interface GetWeatherData {
  city: string;
}
