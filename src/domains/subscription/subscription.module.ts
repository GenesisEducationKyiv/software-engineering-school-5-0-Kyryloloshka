import { Module } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { SubscriptionController } from './subscription.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Subscription } from './entities/subscription.entity';
import { EmailService } from '../email/email.service';
import { WeatherService } from 'src/domains/weather/weather.service';
import { HttpModule } from '@nestjs/axios';
import { WeatherModule } from '../weather/weather.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Subscription]),
    HttpModule,
    WeatherModule,
  ],
  providers: [SubscriptionService, EmailService, WeatherService],
  controllers: [SubscriptionController],
  exports: [SubscriptionService],
})
export class SubscriptionModule {}
