import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { NotificationModule } from './modules/notification.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const appContext =
    await NestFactory.createApplicationContext(NotificationModule);
  const configService = appContext.get(ConfigService);
  const rmqUrl = configService.get<string>('RMQ_URL');

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    NotificationModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: [rmqUrl],
        queue: 'notification_queue',
        exchange: 'notification_exchange',
        queueOptions: {
          durable: false,
        },
      },
    },
  );
  await app.listen();
  console.log('Notification microservice is running');
}

bootstrap();
