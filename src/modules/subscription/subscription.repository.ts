import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subscription } from './entities/subscription.entity';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { Frequency } from 'src/common/types/frequency';

@Injectable()
export class SubscriptionRepository {
  constructor(
    @InjectRepository(Subscription)
    private readonly repo: Repository<Subscription>,
  ) {}

  async findOneByEmail(email: string): Promise<Subscription | null> {
    return this.repo.findOne({ where: { email } });
  }

  async findOneByToken(token: string): Promise<Subscription | null> {
    return this.repo.findOne({ where: { token } });
  }

  async createAndSave(
    dto: CreateSubscriptionDto & { token: string },
  ): Promise<Subscription> {
    const subscription = this.repo.create({
      ...dto,
      confirmed: false,
    });
    return this.repo.save(subscription);
  }

  async save(subscription: Subscription): Promise<Subscription> {
    return this.repo.save(subscription);
  }

  async remove(subscription: Subscription): Promise<void> {
    await this.repo.remove(subscription);
  }

  async findConfirmedByFrequency(
    frequency: Frequency,
  ): Promise<Subscription[]> {
    return this.repo.find({
      where: { confirmed: true, frequency },
    });
  }
}
