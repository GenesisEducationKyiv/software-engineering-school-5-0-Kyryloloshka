import { Module } from '@nestjs/common';
import { SubscriptionModule } from './../subscription/subscription.module';
import { WeatherModule } from './../weather/weather.module';
import { SchedulerService } from './scheduler.service';
import { EmailModule } from './../email/email.module';

@Module({
  imports: [SubscriptionModule, WeatherModule, EmailModule],
  providers: [SchedulerService],
  exports: [SchedulerService],
})
export class SchedulerModule {}
