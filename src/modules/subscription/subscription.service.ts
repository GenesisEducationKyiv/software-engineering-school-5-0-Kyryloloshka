import {
  Injectable,
  ConflictException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { Subscription } from './entities/subscription.entity';
import { EmailService } from '../email/email.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { Frequency } from 'src/common/types/frequency';
import { WeatherService } from 'src/modules/weather/weather.service';
import { generateToken } from 'src/common/generators/token.generator';
import { SubscriptionRepository } from './subscription.repository';
import { ISubscriptionService } from './interfaces/subscription-service.interface';

@Injectable()
export class SubscriptionService implements ISubscriptionService {
  constructor(
    private readonly emailService: EmailService,
    private readonly weatherService: WeatherService,
    private readonly subscriptionRepo: SubscriptionRepository,
  ) {}

  async subscribe(dto: CreateSubscriptionDto): Promise<{ token: string }> {
    const existingSubscription = await this.subscriptionRepo.findOneByEmail(
      dto.email,
    );
    if (existingSubscription) {
      throw new ConflictException('Email already subscribed');
    }

    const weather = await this.weatherService.getWeather({
      city: dto.city,
    });
    if (!weather || !weather.temperature) {
      throw new BadRequestException('Invalid input');
    }

    const token = generateToken();

    await this.subscriptionRepo.createAndSave({
      ...dto,
      token,
    });

    await this.emailService.sendConfirmationEmail(dto.email, token);

    return { token };
  }

  async confirmSubscription(token: string): Promise<void> {
    const subscription = await this.subscriptionRepo.findOneByToken(token);

    if (!subscription) {
      throw new NotFoundException('Invalid or expired token');
    }

    subscription.confirmed = true;
    await this.subscriptionRepo.save(subscription);
  }

  async unsubscribe(token: string): Promise<void> {
    const subscription = await this.subscriptionRepo.findOneByToken(token);

    if (!subscription) {
      throw new NotFoundException('Subscription not found or invalid token');
    }

    await this.subscriptionRepo.remove(subscription);
  }

  async findConfirmedByFrequency(
    frequency: Frequency,
  ): Promise<Subscription[]> {
    return this.subscriptionRepo.findConfirmedByFrequency(frequency);
  }
}
