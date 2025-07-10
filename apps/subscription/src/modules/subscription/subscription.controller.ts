import { Controller, Inject } from '@nestjs/common';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { ISubscriptionService } from './interfaces/subscription-service.interface';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller()
export class SubscriptionController {
  constructor(
    @Inject('ISubscriptionService')
    private readonly subscriptionService: ISubscriptionService,
  ) {}

  @MessagePattern({ cmd: 'subscription.subscribe' })
  async subscribe(@Payload() dto: CreateSubscriptionDto) {
    const token = await this.subscriptionService.subscribe(dto);

    return {
      message: 'Subscription successful. Confirmation email sent.',
      token,
    };
  }

  @MessagePattern({ cmd: 'subscription.confirm' })
  async confirm(@Payload() token: string) {
    await this.subscriptionService.confirmSubscription(token);

    return { message: 'Subscription confirmed successfully' };
  }

  @MessagePattern({ cmd: 'subscription.unsubscribe' })
  async unsubscribe(@Payload() token: string) {
    await this.subscriptionService.unsubscribe(token);

    return { message: 'Successfully unsubscribed' };
  }
}
