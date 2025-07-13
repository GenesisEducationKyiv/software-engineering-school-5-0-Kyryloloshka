import { IWeatherProvider } from '../interfaces/weather-provider.interface';
import { GetWeatherDto } from '../../../../../../libs/common/src/types/weather/dto/get-weather.dto';
import Redis from 'ioredis';
import { MetricsService } from '../metrics/metrics.service';
import { WeatherResponse } from '@lib/common';

export class WeatherProviderCacheDecorator implements IWeatherProvider {
  public readonly providerName = 'WeatherProviderCacheDecorator';

  constructor(
    private readonly provider: IWeatherProvider,
    private readonly redis: Redis,
    private readonly metrics: MetricsService,
    private readonly ttlSeconds: number = 600,
    private readonly cacheEnabled: boolean = true,
  ) {}

  async getWeather({ city }: GetWeatherDto): Promise<WeatherResponse> {
    const end = this.metrics.cacheDuration.startTimer();
    const cacheKey = `weather:${city}`;

    if (this.cacheEnabled) {
      const cached = await this.redis.get(cacheKey);
      if (cached) {
        this.metrics.cacheHitCounter.inc();
        end();
        return JSON.parse(cached);
      }
    }

    this.metrics.cacheMissCounter.inc();
    const result = await this.provider.getWeather({ city });

    if (this.cacheEnabled) {
      await this.redis.set(
        cacheKey,
        JSON.stringify(result),
        'EX',
        this.ttlSeconds,
      );
    }

    end();
    return result;
  }
}
