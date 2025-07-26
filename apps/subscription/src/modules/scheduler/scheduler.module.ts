import { Module } from '@nestjs/common';
import { SchedulerService } from './scheduler.service';
import { SubscriptionModule } from '../subscription/subscription.module';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { WEATHER_PACKAGE_NAME } from '@lib/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    SubscriptionModule,
    ConfigModule,
    ClientsModule.registerAsync([
      {
        name: 'WEATHER_CLIENT',
        useFactory: () => ({
          transport: Transport.GRPC,
          options: {
            package: WEATHER_PACKAGE_NAME,
            protoPath: join(process.cwd(), 'proto/weather.proto'),
            url: '0.0.0.0:5000',
          },
        }),
      },
      {
        name: 'NOTIFICATION_PUBLISHER',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.get<string>('RMQ_URL')],
            queue: 'notification_queue',
            exchange: 'notification_exchange',
            queueOptions: { durable: false },
          },
        }),
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
