import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { NotificationModule } from './modules/notification.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    NotificationModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: ['amqp://localhost:5672'],
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
