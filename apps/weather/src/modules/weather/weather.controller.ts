import { Controller, Inject } from '@nestjs/common';
import { GetWeatherDto } from './dto/get-weather.dto';
import { IWeatherService } from './interfaces/weather-service.interface';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller('weather')
export class WeatherController {
  constructor(
    @Inject('IWeatherService')
    private readonly weatherService: IWeatherService,
  ) {}

  @MessagePattern({ cmd: 'weather.get' })
  async getWeather(@Payload() payload: GetWeatherDto) {
    return await this.weatherService.getWeather(payload);
  }
}
