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
          protoPath: join(__dirname, '../../../proto/subscription.proto'),
          url: '0.0.0.0:5001',
        },
      },
    ]),
  ],
  providers: [SubscriptionService],
  controllers: [SubscriptionController],
})
export class SubscriptionModule {}
