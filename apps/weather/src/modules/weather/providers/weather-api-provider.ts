import { IWeatherProvider } from '../interfaces/weather-provider.interface';
import { WeatherResponse } from '@lib/common/types/weather/weather';
import { mapToWeatherResponse } from '@lib/common/mappers/weather.mapper';
import { GetWeatherData } from '@lib/common';
import { catchError, firstValueFrom, throwError } from 'rxjs';
import { Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { AxiosError } from 'axios';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { LogMethod, LoggerService } from '@lib/common';
import { ErrorCodes } from '@lib/common';
import { CircuitState } from 'cockatiel';
import {
  createWeatherProviderPolicy,
  WeatherProviderPolicy,
} from './weather-policy.factory';

@Injectable()
export class WeatherApiProvider implements IWeatherProvider {
  public readonly providerName = 'WeatherAPI';
  private readonly logger = LoggerService;
  private readonly policy: WeatherProviderPolicy;
  private readonly breaker: import('cockatiel').CircuitBreakerPolicy;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    const { policy, breaker } = createWeatherProviderPolicy(
      this.providerName,
      this.logger,
    );
    this.policy = policy;
    this.breaker = breaker;
  }

  @LogMethod({ context: 'WeatherApiProvider' })
  async getWeather(data: GetWeatherData): Promise<WeatherResponse> {
    const apiKey = this.configService.get<string>('WEATHER_API_KEY');
    if (!apiKey) {
      throw new RpcException(
        `${ErrorCodes.WEATHER_API_ERROR}: Weather API key not configured`,
      );
    }
    const url = `${process.env.WEATHER_BASE_API_URL}/current.json?key=${apiKey}&q=${encodeURIComponent(data.city)}`;
    try {
      const response = await this.policy.execute(() =>
        firstValueFrom(
          this.httpService.get(url).pipe(
            catchError((error: AxiosError) => {
              if (
                error.response?.status === 400 ||
                error.response?.status === 404
              ) {
                return throwError(
                  () =>
                    new RpcException(
                      `${ErrorCodes.CITY_NOT_FOUND}: City not found`,
                    ),
                );
              }
              return throwError(
                () =>
                  new RpcException(
                    `${ErrorCodes.WEATHER_API_ERROR}: Failed to fetch weather data`,
                  ),
              );
            }),
          ),
        ),
      );
      return mapToWeatherResponse(response.data);
    } catch (err) {
      if (this.breaker.state === CircuitState.Open) {
        this.logger.warn(
          `[${this.providerName}] Circuit breaker is OPEN, skipping provider`,
        );
      }
      throw err;
    }
  }
}
