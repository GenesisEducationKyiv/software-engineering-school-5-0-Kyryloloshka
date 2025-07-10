import { Module } from '@nestjs/common';
import { WeatherModule } from './weather/weather.module';
import { SubscriptionModule } from './subscription/subscription.module';

@Module({
  imports: [WeatherModule, SubscriptionModule],
})
export class ApiGatewayModule {}
