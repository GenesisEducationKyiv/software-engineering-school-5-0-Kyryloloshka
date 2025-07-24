import { Module } from '@nestjs/common';
import { WeatherController } from './weather.controller';
import { WeatherService } from './weather.service';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { WeatherProviderChain } from './providers/weather-provider-chain';
import { OpenMeteoWeatherProvider } from './providers/open-meteo-provider';
import { WeatherApiProvider } from './providers/weather-api-provider';
import Redis from 'ioredis';
import { WeatherProviderCacheDecorator } from './decorator/cache.decorator';
import { MetricsModule } from './metrics/metrics.module';
import { envWeatherValidationSchema } from '../../config/env.validation';
import { MetricsService } from './metrics/metrics.service';

@Module({
  imports: [
    HttpModule,
    ConfigModule,
    MetricsModule,
    ConfigModule.forRoot({
      envFilePath: 'apps/weather/.env',
      isGlobal: true,
      validationSchema: envWeatherValidationSchema,
    }),
  ],
  controllers: [WeatherController],
  providers: [
    WeatherApiProvider,
    OpenMeteoWeatherProvider,
    {
      provide: 'REDIS_CLIENT',
      useFactory: (configService: ConfigService) => {
        return new Redis({
          host: configService.get('REDIS_HOST'),
          port: configService.get('REDIS_PORT'),
        });
      },
      inject: [ConfigService],
    },
    {
      provide: 'IWeatherProvider',
      useFactory: (
        weatherApiProvider: WeatherApiProvider,
        openMeteoWeatherProvider: OpenMeteoWeatherProvider,
        MetricsService: MetricsService,
        redis: Redis,
        configService: ConfigService,
      ) => {
        const chain = new WeatherProviderChain([
          weatherApiProvider,
          openMeteoWeatherProvider,
        ]);
        return new WeatherProviderCacheDecorator(
          chain,
          redis,
          MetricsService,
          parseInt(configService.get('CACHE_WEATHER_TTL')),
          configService.get('CACHE_ENABLED') === 'true',
        );
      },
      inject: [
        WeatherApiProvider,
        OpenMeteoWeatherProvider,
        MetricsService,
        'REDIS_CLIENT',
        ConfigService,
      ],
    },
    {
      provide: 'IWeatherService',
      useClass: WeatherService,
    },
  ],
  exports: ['IWeatherService', 'IWeatherProvider'],
})
export class WeatherModule {}
