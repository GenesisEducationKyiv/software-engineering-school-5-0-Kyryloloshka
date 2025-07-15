import { IWeatherProvider } from '../interfaces/weather-provider.interface';
import { WeatherResponse } from '@lib/common/types/weather/weather';
import { mapToWeatherResponse } from '@lib/common/mappers/weather.mapper';
import { GetWeatherDto } from '../../../../../../libs/common/src/types/weather/dto/get-weather.dto';
import { catchError, firstValueFrom, throwError } from 'rxjs';
import { Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { AxiosError } from 'axios';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { LogMethod, LoggerService } from '@lib/common';
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
export class WeatherApiProvider implements IWeatherProvider {
  public readonly providerName = 'WeatherAPI';
  private readonly logger = LoggerService;
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

  @LogMethod({ context: 'WeatherApiProvider' })
  async getWeather({ city }: GetWeatherDto): Promise<WeatherResponse> {
    const apiKey = this.configService.get<string>('WEATHER_API_KEY');
    if (!apiKey) {
      throw new RpcException(
        `${ErrorCodes.WEATHER_API_ERROR}: Weather API key not configured`,
      );
    }
    const url = `${process.env.WEATHER_BASE_API_URL}/current.json?key=${apiKey}&q=${encodeURIComponent(city)}`;
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
      if (this.policy.policies[1].state === CircuitState.Open) {
        this.logger.warn(
          `[${this.providerName}] Circuit breaker is OPEN, skipping provider`,
        );
      }
      throw err;
    }
  }
}
