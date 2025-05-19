import {
  Injectable,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subscription } from './entities/subscription.entity';
import { randomBytes } from 'crypto';
import { EmailService } from './../email/email.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { Frequency } from './../common/types/frequency';
import { WeatherService } from 'src/weather/weather.service';

@Injectable()
export class SubscriptionService {
  constructor(
    @InjectRepository(Subscription)
    private readonly subscriptionRepo: Repository<Subscription>,
    private readonly emailService: EmailService,
    private readonly weatherService: WeatherService,
  ) {}

  async subscribe(dto: CreateSubscriptionDto): Promise<string> {
    const existing = await this.subscriptionRepo.findOne({
      where: { email: dto.email },
    });
    if (existing) {
      throw new ConflictException('Email already subscribed');
    }

    const weather = await this.weatherService.getWeather({
      city: dto.city,
    });
    if (!weather) {
      throw new BadRequestException('Invalid input');
    }

    const token = randomBytes(16).toString('hex');

    const subscription = this.subscriptionRepo.create({
      ...dto,
      token,
      confirmed: false,
    });

    await this.subscriptionRepo.save(subscription);
    await this.emailService.sendConfirmationEmail(dto.email, token);

    return token;
  }

  async confirmSubscription(token: string): Promise<boolean> {
    const subscription = await this.subscriptionRepo.findOne({
      where: { token },
    });

    if (!subscription) return false;

    subscription.confirmed = true;
    await this.subscriptionRepo.save(subscription);

    return true;
  }

  async unsubscribe(token: string): Promise<boolean> {
    const subscription = await this.subscriptionRepo.findOne({
      where: { token },
    });

    if (!subscription) return false;

    await this.subscriptionRepo.remove(subscription);

    return true;
  }

  async findConfirmedByFrequency(
    frequency: Frequency,
  ): Promise<Subscription[]> {
    return this.subscriptionRepo.find({
      where: { confirmed: true, frequency },
    });
  }
}
