import { IWeatherProvider } from '../interfaces/IWeatherProvider';
import { GetWeatherDto } from '../dto/get-weather.dto';
import { WeatherResponse } from 'src/common/types/weather';
import Redis from 'ioredis';
import { Counter, Histogram } from 'prom-client';

const cacheHitCounter = new Counter({
  name: 'weather_cache_hit_total',
  help: 'Total number of cache hits',
});
const cacheMissCounter = new Counter({
  name: 'weather_cache_miss_total',
  help: 'Total number of cache misses',
});
const cacheDuration = new Histogram({
  name: 'weather_cache_duration_seconds',
  help: 'Duration of weather cache requests in seconds',
});

export class WeatherProviderCacheProxy implements IWeatherProvider {
  constructor(
    private readonly provider: IWeatherProvider,
    private readonly redis: Redis,
    private readonly ttlSeconds: number = 600,
    private readonly cacheEnabled: boolean = true,
  ) {}

  async getWeather({ city }: GetWeatherDto): Promise<WeatherResponse> {
    const end = cacheDuration.startTimer();
    const cacheKey = `weather:${city}`;

    if (this.cacheEnabled) {
      const cached = await this.redis.get(cacheKey);
      if (cached) {
        cacheHitCounter.inc();
        end();
        return JSON.parse(cached);
      }
    }

    cacheMissCounter.inc();
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
