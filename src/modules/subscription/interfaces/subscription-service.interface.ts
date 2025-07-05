import { Frequency } from 'src/common/types/frequency';
import { CreateSubscriptionDto } from '../dto/create-subscription.dto';
import { Subscription } from '../entities/subscription.entity';

export interface ISubscriptionService {
  subscribe(dto: CreateSubscriptionDto): Promise<{ token: string }>;
  confirmSubscription(token: string): Promise<void>;
  unsubscribe(token: string): Promise<void>;
  findConfirmedByFrequency(frequency: Frequency): Promise<Subscription[]>;
}
