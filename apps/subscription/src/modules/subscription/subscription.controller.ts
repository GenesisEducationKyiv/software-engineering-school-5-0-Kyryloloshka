import { Controller, Inject } from '@nestjs/common';
import { CreateSubscriptionDto } from '../../../../../libs/common/src/types/subscription/dto/create-subscription.dto';
import { ISubscriptionService } from './interfaces/subscription-service.interface';
import { GrpcMethod } from '@nestjs/microservices';
import {
  ConfirmSubscriptionDto,
  ConfirmSubscriptionResponse,
  SubscribeResponse,
  SUBSCRIPTION_SERVICE_NAME,
  UnsubscribeDto,
  UnsubscribeResponse,
} from '@lib/common';

@Controller()
export class SubscriptionController {
  constructor(
    @Inject('ISubscriptionService')
    private readonly subscriptionService: ISubscriptionService,
  ) {}

  @GrpcMethod(SUBSCRIPTION_SERVICE_NAME, 'Subscribe')
  async subscribe(dto: CreateSubscriptionDto): Promise<SubscribeResponse> {
    const { token } = await this.subscriptionService.subscribe(dto);

    return {
      message: 'Subscription successful. Confirmation email sent.',
      token,
    };
  }

  @GrpcMethod(SUBSCRIPTION_SERVICE_NAME, 'Confirm')
  async confirmSubscription(
    dto: ConfirmSubscriptionDto,
  ): Promise<ConfirmSubscriptionResponse> {
    await this.subscriptionService.confirmSubscription(dto);

    return { message: 'Subscription confirmed successfully' };
  }

  @GrpcMethod(SUBSCRIPTION_SERVICE_NAME, 'Unsubscribe')
  async unsubscribe(dto: UnsubscribeDto): Promise<UnsubscribeResponse> {
    await this.subscriptionService.unsubscribe(dto);

    return { message: 'Successfully unsubscribed' };
  }
}
