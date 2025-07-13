import { Injectable, Inject } from '@nestjs/common';
import { ISubscriptionService } from './interfaces/subscription-service.interface';
import { ClientGrpc } from '@nestjs/microservices';
import {
  ConfirmSubscriptionDto,
  SUBSCRIPTION_SERVICE_NAME,
  UnsubscribeDto,
  CreateSubscriptionDto,
  SubscribeResponse,
  ConfirmSubscriptionResponse,
  UnsubscribeResponse,
} from '@lib/common';

@Injectable()
export class SubscriptionService implements ISubscriptionService {
  private subscriptionService: any;

  constructor(
    @Inject('SUBSCRIPTION_CLIENT')
    private readonly client: ClientGrpc,
  ) {}

  onModuleInit() {
    this.subscriptionService = this.client.getService<any>(
      SUBSCRIPTION_SERVICE_NAME,
    );
  }

  async subscribe(dto: CreateSubscriptionDto): Promise<SubscribeResponse> {
    return this.subscriptionService.subscribe(dto);
  }

  async confirmSubscription(
    dto: ConfirmSubscriptionDto,
  ): Promise<ConfirmSubscriptionResponse> {
    return this.subscriptionService.Confirm(dto).toPromise();
  }

  async unsubscribe(dto: UnsubscribeDto): Promise<UnsubscribeResponse> {
    return this.subscriptionService.unsubscribe(dto);
  }
}
