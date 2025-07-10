import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { GetWeatherDto } from 'apps/weather/src/modules/weather/dto/get-weather.dto';

@Injectable()
export class WeatherService {
  constructor(
    @Inject('WEATHER_CLIENT')
    private readonly weatherClient: ClientProxy,
  ) {}

  async getWeather({ city }: GetWeatherDto): Promise<any> {
    return this.weatherClient.send({ cmd: 'weather.get' }, { city });
  }
}
