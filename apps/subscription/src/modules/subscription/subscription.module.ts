import { Module } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { SubscriptionController } from './subscription.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Subscription } from './entities/subscription.entity';
import { HttpModule } from '@nestjs/axios';
import { SubscriptionRepository } from './subscription.repository';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { WEATHER_PACKAGE_NAME } from '@lib/common';
import { MetricsModule } from './metrics/metrics.module';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([Subscription]),
    HttpModule,
    MetricsModule,
    ConfigModule,
    ClientsModule.registerAsync([
      {
        name: 'WEATHER_CLIENT',
        useFactory: () => ({
          transport: Transport.GRPC,
          options: {
            package: WEATHER_PACKAGE_NAME,
            protoPath: join(process.cwd(), 'proto/weather.proto'),
            url: process.env.WEATHER_SERVICE_URL || 'weather:5000',
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
            queueOptions: {
              durable: false,
            },
          },
        }),
      },
    ]),
  ],
  providers: [
    {
      provide: 'ISubscriptionRepository',
      useClass: SubscriptionRepository,
    },
    {
      provide: 'ISubscriptionService',
      useClass: SubscriptionService,
    },
  ],
  controllers: [SubscriptionController],
  exports: ['ISubscriptionService'],
})
export class SubscriptionModule {}
