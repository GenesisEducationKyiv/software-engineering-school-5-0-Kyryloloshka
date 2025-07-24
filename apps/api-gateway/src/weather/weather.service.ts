import {
  GetWeatherDto,
  WEATHER_SERVICE_NAME,
  WeatherServiceClient,
} from '@lib/common';
import { Inject, Injectable } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { RpcException } from '@nestjs/microservices';
import { IWeatherService } from './interfaces/weather-service.interface';

@Injectable()
export class WeatherService implements IWeatherService {
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
    try {
      return await firstValueFrom(this.weatherService.GetWeather({ city }));
    } catch (error) {
      if (error instanceof RpcException) {
        throw error;
      }
      throw new RpcException(error.message || 'Internal server error');
    }
  }
}
