import { Module } from '@nestjs/common';
import { SubscriptionController } from './subscription.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { SubscriptionService } from './subscription.service';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'SUBSCRIPTION_CLIENT',
        transport: Transport.TCP,
        options: {
          port: 3002,
        },
      },
    ]),
  ],
  providers: [SubscriptionService],
  controllers: [SubscriptionController],
})
export class SubscriptionModule {}
