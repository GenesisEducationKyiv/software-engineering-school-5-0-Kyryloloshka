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
import { CircuitBreakerPolicy, CircuitState } from 'cockatiel';
import {
  createWeatherProviderPolicy,
  WeatherProviderPolicy,
} from './weather-policy.factory';

@Injectable()
export class OpenMeteoWeatherProvider implements IWeatherProvider {
  public readonly providerName = 'OpenMeteo';
  private readonly logger = LoggerService;
  private readonly policy: WeatherProviderPolicy;
  private readonly breaker: CircuitBreakerPolicy;

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

  @LogMethod({ context: 'OpenMeteoWeatherProvider' })
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

  @LogMethod({ context: 'OpenMeteoWeatherProvider' })
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
      if (this.breaker.state === CircuitState.Open) {
        this.logger.warn(
          `[${this.providerName}] Circuit breaker is OPEN, skipping provider`,
        );
      }
      throw err;
    }
  }
}
