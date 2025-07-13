import { Frequency } from '@lib/common/types/frequency';
import { Subscription } from '../entities/subscription.entity';
import {
  ConfirmSubscriptionDto,
  CreateSubscriptionDto,
  UnsubscribeDto,
} from '@lib/common';

export interface ISubscriptionService {
  subscribe(dto: CreateSubscriptionDto): Promise<{ token: string }>;
  confirmSubscription(dto: ConfirmSubscriptionDto): Promise<void>;
  unsubscribe(dto: UnsubscribeDto): Promise<void>;
  findConfirmedByFrequency(frequency: Frequency): Promise<Subscription[]>;
}
