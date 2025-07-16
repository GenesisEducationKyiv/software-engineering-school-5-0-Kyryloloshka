import { Module } from '@nestjs/common';
import { EmailModule } from './email/email.module';
import { NotificationConsumer } from './notification.consumer';
import { ConfigModule } from '@nestjs/config';
import { envNotificationValidationSchema } from '../config/env.validation';

@Module({
  imports: [
    EmailModule,
    ConfigModule.forRoot({
      envFilePath: 'apps/notification/.env',
      isGlobal: true,
      validationSchema: envNotificationValidationSchema,
    }),
  ],
  controllers: [NotificationConsumer],
  exports: [EmailModule],
})
export class NotificationModule {}
