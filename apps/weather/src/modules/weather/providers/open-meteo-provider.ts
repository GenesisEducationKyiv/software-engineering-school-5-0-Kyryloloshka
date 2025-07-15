import { IWeatherProvider } from '../interfaces/weather-provider.interface';
import { WeatherResponse } from '@lib/common/types/weather/weather';
import { mapToWeatherResponse } from '@lib/common/mappers/weather.mapper';
import { GetWeatherDto } from '../../../../../../libs/common/src/types/weather/dto/get-weather.dto';
import { catchError, firstValueFrom, throwError } from 'rxjs';
import { Injectable, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { AxiosError } from 'axios';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { LogWeatherProvider } from '../decorator/log-weather-provider.decorator';
import { ErrorCodes } from '@lib/common';
import {
  circuitBreaker,
  handleAll,
  ConsecutiveBreaker,
  CircuitState,
  retry,
  ExponentialBackoff,
  wrap,
} from 'cockatiel';

@Injectable()
export class OpenMeteoWeatherProvider implements IWeatherProvider {
  public readonly providerName = 'OpenMeteo';
  private readonly logger = new Logger(OpenMeteoWeatherProvider.name);
  private readonly policy;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    const breaker = circuitBreaker(handleAll, {
      halfOpenAfter: 10_000,
      breaker: new ConsecutiveBreaker(3),
    });
    breaker.onBreak(() => {
      this.logger.warn(`[${this.providerName}] Circuit breaker OPEN`);
    });
    breaker.onReset(() => {
      this.logger.log(`[${this.providerName}] Circuit breaker CLOSED`);
    });
    breaker.onHalfOpen(() => {
      this.logger.log(`[${this.providerName}] Circuit breaker HALF-OPEN`);
    });

    const retryPolicy = retry(handleAll, {
      maxAttempts: 3,
      backoff: new ExponentialBackoff({ initialDelay: 200, maxDelay: 1000 }),
    });
    retryPolicy.onRetry((info: any) => {
      const { attempt, delay } = info;
      const reason = info.reason ?? info.error ?? info.value;
      this.logger.warn(
        `[${this.providerName}] Retry attempt #${attempt} after ${delay}ms due to: ${reason instanceof Error ? reason.message : String(reason)}`,
      );
    });

    this.policy = wrap(retryPolicy, breaker);
  }

  @LogWeatherProvider()
  private async getCoordinates(
    city: string,
  ): Promise<{ latitude: number; longitude: number }> {
    const baseUrl = this.configService.get<string>('OPENMETEO_GEO_API_URL');
    const url = `${baseUrl}/search?name=${encodeURIComponent(city)}`;
    const geo = await firstValueFrom(
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
                `${ErrorCodes.WEATHER_PROVIDER_ERROR}: Failed to fetch coordinates`,
              ),
          );
        }),
      ),
    );
    if (!geo.data.results?.length) {
      throw new RpcException(`${ErrorCodes.CITY_NOT_FOUND}: City not found`);
    }
    return {
      latitude: geo.data.results[0].latitude,
      longitude: geo.data.results[0].longitude,
    };
  }

  @LogWeatherProvider()
  async getWeather({ city }: GetWeatherDto): Promise<WeatherResponse> {
    const baseUrl = this.configService.get<string>('OPENMETEO_BASE_API_URL');

    const { latitude, longitude } = await this.getCoordinates(city);
    const getWeatherUrl = `${baseUrl}/forecast?latitude=${latitude}&longitude=${longitude}&current-weather=true&current=relative_humidity_2m,temperature_2m,weather_code,is_day`;
    try {
      const response = await this.policy.execute(() =>
        firstValueFrom(
          this.httpService.get(getWeatherUrl).pipe(
            catchError((error: any) => {
              if (error.reason === 'Not Found') {
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
                    `${ErrorCodes.WEATHER_PROVIDER_ERROR}: Failed to fetch weather data`,
                  ),
              );
            }),
          ),
        ),
      );
      return mapToWeatherResponse(response.data);
    } catch (err) {
      if (this.policy.policies[1].state === CircuitState.Open) {
        this.logger.warn(
          `[${this.providerName}] Circuit breaker is OPEN, skipping provider`,
        );
      }
      throw err;
    }
  }
}
