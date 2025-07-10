import { Module } from '@nestjs/common';
import { SchedulerService } from './scheduler.service';
import { SubscriptionModule } from '../subscription/subscription.module';
import { EmailModule } from '../email/email.module';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    SubscriptionModule,
    EmailModule,
    ClientsModule.register([
      {
        name: 'WEATHER_CLIENT',
        transport: Transport.TCP,
        options: {
          port: 3001,
        },
      },
    ]),
  ],
  providers: [
    {
      provide: 'ISchedulerService',
      useClass: SchedulerService,
    },
  ],
  exports: ['ISchedulerService'],
})
export class SchedulerModule {}
