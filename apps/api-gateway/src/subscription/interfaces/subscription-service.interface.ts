import { CreateSubscriptionDto } from 'apps/subscription/src/modules/subscription/dto/create-subscription.dto';

export interface ISubscriptionService {
  subscribe(dto: CreateSubscriptionDto);
  confirmSubscription(token: string);
  unsubscribe(token: string);
}
