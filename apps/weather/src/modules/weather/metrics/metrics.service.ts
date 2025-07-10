import { Injectable } from '@nestjs/common';
import { Counter, Histogram, Registry } from 'prom-client';

@Injectable()
export class MetricsService {
  public readonly cacheHitCounter: Counter<string>;
  public readonly cacheMissCounter: Counter<string>;
  public readonly cacheDuration: Histogram<string>;
  public readonly registry: Registry;

  constructor() {
    this.registry = new Registry();

    this.cacheHitCounter = new Counter({
      name: 'weather_cache_hit_total',
      help: 'Total number of cache hits',
      registers: [this.registry],
    });
    this.cacheMissCounter = new Counter({
      name: 'weather_cache_miss_total',
      help: 'Total number of cache misses',
      registers: [this.registry],
    });
    this.cacheDuration = new Histogram({
      name: 'weather_cache_duration_seconds',
      help: 'Duration of weather cache requests in seconds',
      registers: [this.registry],
    });
  }

  async getMetrics(): Promise<string> {
    return this.registry.metrics();
  }

  get contentType(): string {
    return this.registry.contentType;
  }
}
