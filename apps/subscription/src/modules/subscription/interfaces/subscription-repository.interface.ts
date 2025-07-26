import { Frequency } from '@lib/common/types/frequency';
import { Subscription } from '../entities/subscription.entity';
import { CreateSubscriptionData } from '@lib/common';

export interface ISubscriptionRepository {
  findOneByEmail(email: string): Promise<Subscription | null>;

  findOneByToken(token: string): Promise<Subscription | null>;

  createAndSave(data: CreateSubscriptionData): Promise<Subscription>;

  save(subscription: Subscription): Promise<Subscription>;

  remove(subscription: Subscription): Promise<void>;

  findConfirmedByFrequency(frequency: Frequency): Promise<Subscription[]>;
}
