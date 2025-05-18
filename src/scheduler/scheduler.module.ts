import { Module } from '@nestjs/common';
import { SubscriptionModule } from 'src/subscription/subscription.module';
import { WeatherModule } from 'src/weather/weather.module';
import { SchedulerService } from './scheduler.service';
import { EmailModule } from 'src/email/email.module';

@Module({
  imports: [SubscriptionModule, WeatherModule, EmailModule],
  providers: [SchedulerService],
  exports: [SchedulerService],
})
export class SchedulerModule {}
