import { Module } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { SubscriptionController } from './subscription.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Subscription } from './entities/subscription.entity';
import { HttpModule } from '@nestjs/axios';
import { SubscriptionRepository } from './subscription.repository';
import { EmailModule } from '../email/email.module';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { WEATHER_PACKAGE_NAME } from '@lib/common';

@Module({
  imports: [
    TypeOrmModule.forFeature([Subscription]),
    HttpModule,
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
