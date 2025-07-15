import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { envSubscriptionValidationSchema } from '../config/env.validation';
import { typeOrmConfig } from '../config/typeorm.config';
import { SubscriptionModule } from './subscription/subscription.module';
import { SchedulerModule } from './scheduler/scheduler.module';
import { EmailModule } from './email/email.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '../..', 'public'),
      exclude: ['/api', '/swagger'],
    }),
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      envFilePath: 'apps/subscription/.env',
      isGlobal: true,
      validationSchema: envSubscriptionValidationSchema,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: typeOrmConfig,
    }),
    SubscriptionModule,
    SchedulerModule,
    EmailModule,
  ],
})
export class AppModule {}
