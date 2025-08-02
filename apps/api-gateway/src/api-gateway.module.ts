import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { WeatherModule } from './weather/weather.module';
import { SubscriptionModule } from './subscription/subscription.module';
import { envApiGatewayValidationSchema } from './config/env.validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: envApiGatewayValidationSchema,
    }),
    WeatherModule,
    SubscriptionModule,
  ],
  controllers: [],
})
export class ApiGatewayModule {}
