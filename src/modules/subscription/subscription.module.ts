import { Module } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { SubscriptionController } from './subscription.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Subscription } from './entities/subscription.entity';
import { HttpModule } from '@nestjs/axios';
import { WeatherModule } from '../weather/weather.module';
import { SubscriptionRepository } from './subscription.repository';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Subscription]),
    HttpModule,
    WeatherModule,
    EmailModule,
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
