import {
  Injectable,
  ConflictException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subscription } from './entities/subscription.entity';
import { EmailService } from '../email/email.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { Frequency } from 'src/common/types/frequency';
import { WeatherService } from 'src/domains/weather/weather.service';
import { generateToken } from 'src/common/generators/token.generator';

@Injectable()
export class SubscriptionService {
  constructor(
    @InjectRepository(Subscription)
    private readonly subscriptionRepo: Repository<Subscription>,
    private readonly emailService: EmailService,
    private readonly weatherService: WeatherService,
  ) {}

  async subscribe(dto: CreateSubscriptionDto): Promise<string> {
    const existingSubscription = await this.subscriptionRepo.findOne({
      where: { email: dto.email },
    });
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

    const subscription = this.subscriptionRepo.create({
      ...dto,
      token,
      confirmed: false,
    });

    await this.subscriptionRepo.save(subscription);
    await this.emailService.sendConfirmationEmail(dto.email, token);

    return token;
  }

  async confirmSubscription(token: string): Promise<void> {
    const subscription = await this.subscriptionRepo.findOne({
      where: { token },
    });

    if (!subscription) {
      throw new NotFoundException('Invalid or expired token');
    }

    subscription.confirmed = true;
    await this.subscriptionRepo.save(subscription);
  }

  async unsubscribe(token: string): Promise<void> {
    const subscription = await this.subscriptionRepo.findOne({
      where: { token },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found or invalid token');
    }

    await this.subscriptionRepo.remove(subscription);
  }

  async findConfirmedByFrequency(
    frequency: Frequency,
  ): Promise<Subscription[]> {
    return this.subscriptionRepo.find({
      where: { confirmed: true, frequency },
    });
  }
}
