import {
  ConfirmSubscriptionDto,
  ConfirmSubscriptionResponse,
  UnsubscribeDto,
  UnsubscribeResponse,
} from '@lib/common';
import { CreateSubscriptionDto } from '@lib/common';

export interface ISubscriptionService {
  subscribe(dto: CreateSubscriptionDto): Promise<ConfirmSubscriptionResponse>;
  confirmSubscription(
    dto: ConfirmSubscriptionDto,
  ): Promise<ConfirmSubscriptionResponse>;
  unsubscribe(dto: UnsubscribeDto): Promise<UnsubscribeResponse>;
}
