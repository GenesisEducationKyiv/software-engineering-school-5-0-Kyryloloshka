import {
  GetWeatherDto,
  WEATHER_SERVICE_NAME,
  WeatherServiceClient,
} from '@lib/common';
import { Inject, Injectable } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';

@Injectable()
export class WeatherService {
  private weatherService: WeatherServiceClient;

  constructor(
    @Inject('WEATHER_CLIENT')
    private readonly client: ClientGrpc,
  ) {}

  onModuleInit() {
    this.weatherService =
      this.client.getService<WeatherServiceClient>(WEATHER_SERVICE_NAME);
  }

  async getWeather({ city }: GetWeatherDto): Promise<any> {
    return this.weatherService.getWeather({ city });
  }
}
