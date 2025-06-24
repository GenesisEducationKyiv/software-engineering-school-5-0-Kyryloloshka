import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from './config/typeorm.config';
import { WeatherModule } from './domains/weather/weather.module';
import { SubscriptionModule } from './domains/subscription/subscription.module';
import { ScheduleModule } from '@nestjs/schedule';
import { SchedulerModule } from './domains/scheduler/scheduler.module';
import { EmailModule } from './domains/email/email.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { envValidationSchema } from './config/env.validation';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '../..', 'public'),
      exclude: ['/api', '/swagger'],
    }),
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: envValidationSchema,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: typeOrmConfig,
    }),
    WeatherModule,
    SubscriptionModule,
    SchedulerModule,
    EmailModule,
  ],
})
export class AppModule {}
