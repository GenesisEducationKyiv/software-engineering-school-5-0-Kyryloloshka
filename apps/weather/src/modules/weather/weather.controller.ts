import { Controller, Inject } from '@nestjs/common';
import { IWeatherService } from './interfaces/weather-service.interface';
import { GrpcMethod } from '@nestjs/microservices';
import {
  GetWeatherDto,
  WEATHER_SERVICE_NAME,
  WeatherResponse,
} from '@lib/common';

@Controller('weather')
export class WeatherController {
  constructor(
    @Inject('IWeatherService')
    private readonly weatherService: IWeatherService,
  ) {}

  @GrpcMethod(WEATHER_SERVICE_NAME, 'GetWeather')
  async getWeather(dto: GetWeatherDto): Promise<WeatherResponse> {
    return await this.weatherService.getWeather(dto);
  }
}
