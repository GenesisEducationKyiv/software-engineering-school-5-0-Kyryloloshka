import { Frequency } from 'src/common/types/frequency';
import { CreateSubscriptionDto } from '../dto/create-subscription.dto';
import { Subscription } from '../entities/subscription.entity';

export interface ISubscriptionRepository {
  findOneByEmail(email: string): Promise<Subscription | null>;

  findOneByToken(token: string): Promise<Subscription | null>;

  createAndSave(
    dto: CreateSubscriptionDto & { token: string },
  ): Promise<Subscription>;

  save(subscription: Subscription): Promise<Subscription>;

  remove(subscription: Subscription): Promise<void>;

  findConfirmedByFrequency(frequency: Frequency): Promise<Subscription[]>;
}
