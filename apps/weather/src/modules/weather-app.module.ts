import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { WeatherModule } from './weather/weather.module';
import { envWeatherValidationSchema } from '../config/env.validation';
import { MetricsModule } from './weather/metrics/metrics.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: envWeatherValidationSchema,
    }),
    WeatherModule,
    MetricsModule,
  ],
})
export class WeatherAppModule {}
