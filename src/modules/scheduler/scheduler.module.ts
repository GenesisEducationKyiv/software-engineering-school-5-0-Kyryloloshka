import { Module } from '@nestjs/common';
import { SchedulerService } from './scheduler.service';
import { SubscriptionModule } from '../subscription/subscription.module';
import { EmailModule } from '../email/email.module';
import { WeatherModule } from '../weather/weather.module';

@Module({
  imports: [SubscriptionModule, WeatherModule, EmailModule],
  providers: [
    {
      provide: 'ISchedulerService',
      useClass: SchedulerService,
    },
  ],
  exports: ['ISchedulerService'],
})
export class SchedulerModule {}
