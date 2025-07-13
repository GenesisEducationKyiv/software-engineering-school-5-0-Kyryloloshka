import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { WeatherModule } from './weather/weather.module';
import { envWeatherValidationSchema } from '../config/env.validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: envWeatherValidationSchema,
    }),
    WeatherModule,
  ],
  controllers: [],
  providers: [],
})
export class WeatherAppModule {}
