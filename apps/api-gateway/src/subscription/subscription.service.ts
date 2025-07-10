import { Injectable, Inject } from '@nestjs/common';
import { CreateSubscriptionDto } from 'apps/subscription/src/modules/subscription/dto/create-subscription.dto';
import { ISubscriptionService } from './interfaces/subscription-service.interface';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class SubscriptionService implements ISubscriptionService {
  constructor(
    @Inject('SUBSCRIPTION_CLIENT')
    private readonly subscriptionClient: ClientProxy,
  ) {}

  async subscribe(dto: CreateSubscriptionDto) {
    return await this.subscriptionClient.send(
      { cmd: 'subscription.subscribe' },
      dto,
    );
  }

  async confirmSubscription(token: string) {
    return await this.subscriptionClient.send(
      { cmd: 'subscription.confirm' },
      token,
    );
  }

  async unsubscribe(token: string) {
    return await this.subscriptionClient.send(
      { cmd: 'subscription.unsubscribe' },
      token,
    );
  }
}
