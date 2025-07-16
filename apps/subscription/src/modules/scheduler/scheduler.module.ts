import { Module } from '@nestjs/common';
import { SchedulerService } from './scheduler.service';
import { SubscriptionModule } from '../subscription/subscription.module';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { WEATHER_PACKAGE_NAME } from '@lib/common';

@Module({
  imports: [
    SubscriptionModule,
    ClientsModule.register([
      {
        name: 'WEATHER_CLIENT',
        transport: Transport.GRPC,
        options: {
          package: WEATHER_PACKAGE_NAME,
          protoPath: join(process.cwd(), 'proto/weather.proto'),
          url: '0.0.0.0:5000',
        },
      },
      {
        name: 'NOTIFICATION_PUBLISHER',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://localhost:5672'],
          queue: 'notification_queue',
          exchange: 'notification_exchange',
          queueOptions: { durable: false },
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
