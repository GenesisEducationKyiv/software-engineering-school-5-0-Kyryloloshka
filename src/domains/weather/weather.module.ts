import { Module } from '@nestjs/common';
import { WeatherController } from './weather.controller';
import { WeatherService } from './weather.service';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { WeatherProviderChain } from './providers/weather-provider-chain';
import { OpenMeteoWeatherProvider } from './providers/open-meteo-provider';
import { WeatherApiProvider } from './providers/weather-api-provider';
import Redis from 'ioredis';
import { WeatherProviderCacheDecorator } from './decorators/cache.decorator';

@Module({
  imports: [HttpModule, ConfigModule],
  controllers: [WeatherController],
  providers: [
    WeatherService,
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
          parseInt(configService.get('CACHE_WEATHER_TTL')),
          configService.get('CACHE_ENABLED') === 'true',
        );
      },
      inject: [
        WeatherApiProvider,
        OpenMeteoWeatherProvider,
        'REDIS_CLIENT',
        ConfigService,
      ],
    },
  ],
  exports: [WeatherService, 'IWeatherProvider'],
})
export class WeatherModule {}
