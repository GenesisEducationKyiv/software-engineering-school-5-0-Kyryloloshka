import { RpcException } from '@nestjs/microservices';
import { WeatherResponse } from '../types/weather/weather';
import { mapToWeatherDescription } from './wmo-description.mapper';
import { mapToDay } from './day.mapper';
import { ErrorCodes } from '../types/errors';

export const mapToWeatherResponse = (data: any): WeatherResponse => {
  if (
    data?.current &&
    typeof data.current.temp_c === 'number' &&
    typeof data.current.humidity === 'number' &&
    data.current.condition?.text
  ) {
    return {
      temperature: data.current.temp_c,
      humidity: data.current.humidity,
      description: data.current.condition.text,
    };
  }

  if (
    data?.current &&
    typeof data.current.temperature_2m === 'number' &&
    typeof data.current.relative_humidity_2m === 'number' &&
    typeof data.current.weather_code === 'number' &&
    typeof data.current.is_day === 'number'
  ) {
    return {
      temperature: data.current.temperature_2m,
      humidity: data.current.relative_humidity_2m,
      description: mapToWeatherDescription(
        data.current.weather_code,
        mapToDay(data.current.is_day),
      ),
    };
  }

  throw new RpcException(
    `${ErrorCodes.WEATHER_PROVIDER_ERROR}: Invalid weather data format received`,
  );
};
