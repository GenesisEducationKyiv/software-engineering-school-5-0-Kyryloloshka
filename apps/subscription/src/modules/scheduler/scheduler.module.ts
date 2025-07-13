import { Module } from '@nestjs/common';
import { SchedulerService } from './scheduler.service';
import { SubscriptionModule } from '../subscription/subscription.module';
import { EmailModule } from '../email/email.module';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { WEATHER_PACKAGE_NAME } from '@lib/common';

@Module({
  imports: [
    SubscriptionModule,
    EmailModule,
    ClientsModule.register([
      {
        name: 'WEATHER_CLIENT',
        transport: Transport.GRPC,
        options: {
          package: WEATHER_PACKAGE_NAME,
          protoPath: join(__dirname, '../../../../../proto/weather.proto'),
          url: '0.0.0.0:5000',
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
