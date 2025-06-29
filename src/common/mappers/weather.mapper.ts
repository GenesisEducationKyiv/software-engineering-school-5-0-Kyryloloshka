import { InternalServerErrorException } from '@nestjs/common';
import { WeatherResponse } from '../types/weather';

export const mapToWeatherResponse = (data: any): WeatherResponse => {
  if (
    !data?.current ||
    typeof data.current.temp_c !== 'number' ||
    typeof data.current.humidity !== 'number' ||
    !data.current.condition?.text
  ) {
    throw new InternalServerErrorException('Invalid weather data received');
  }

  return {
    temperature: data.current.temp_c,
    humidity: data.current.humidity,
    description: data.current.condition.text,
  };
};
