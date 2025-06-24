import { Module } from '@nestjs/common';
import { WeatherController } from './weather.controller';
import { WeatherService } from './weather.service';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { WeatherProviderChain } from './providers/weather-provider-chain';
import { OpenMeteoWeatherProvider } from './providers/open-meteo-provider';
import { WeatherApiProvider } from './providers/weather-api-provider';

@Module({
  imports: [HttpModule, ConfigModule],
  controllers: [WeatherController],
  providers: [
    WeatherService,
    WeatherApiProvider,
    OpenMeteoWeatherProvider,
    {
      provide: 'IWeatherProvider',
      useFactory: (
        weatherApiProvider: WeatherApiProvider,
        openMeteoWeatherProvider: OpenMeteoWeatherProvider,
      ) =>
        new WeatherProviderChain([
          weatherApiProvider,
          openMeteoWeatherProvider,
        ]),
      inject: [WeatherApiProvider, OpenMeteoWeatherProvider],
    },
  ],
  exports: [WeatherService, 'IWeatherProvider'],
})
export class WeatherModule {}
