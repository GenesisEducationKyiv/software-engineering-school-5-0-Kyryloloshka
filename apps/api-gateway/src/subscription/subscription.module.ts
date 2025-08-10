import { Module } from '@nestjs/common';
import { SubscriptionController } from './subscription.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { SubscriptionService } from './subscription.service';
import { join } from 'path';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'SUBSCRIPTION_CLIENT',
        transport: Transport.GRPC,
        options: {
          package: 'subscription',
          protoPath: join(process.cwd(), 'proto/subscription.proto'),
          url: process.env.SUBSCRIPTION_SERVICE_URL || 'subscription:5001',
        },
      },
    ]),
  ],
  providers: [SubscriptionService],
  controllers: [SubscriptionController],
})
export class SubscriptionModule {}
