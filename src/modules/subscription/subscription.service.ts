import {
  Injectable,
  ConflictException,
  BadRequestException,
  NotFoundException,
  Inject,
} from '@nestjs/common';
import { Subscription } from './entities/subscription.entity';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { Frequency } from 'src/common/types/frequency';
import { generateToken } from 'src/common/generators/token.generator';
import { ISubscriptionService } from './interfaces/subscription-service.interface';
import { LogSubscription } from './decorators/log-subscription.decorator';
import { IEmailService } from '../email/interfaces/email-service.interface';
import { IWeatherService } from '../weather/interfaces/weather-service.interface';
import { ISubscriptionRepository } from './interfaces/subscription-repository.interface';

@Injectable()
export class SubscriptionService implements ISubscriptionService {
  constructor(
    @Inject('IEmailService')
    private readonly emailService: IEmailService,
    @Inject('IWeatherService')
    private readonly weatherService: IWeatherService,
    @Inject('ISubscriptionRepository')
    private readonly subscriptionRepo: ISubscriptionRepository,
  ) {}

  @LogSubscription()
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

  @LogSubscription()
  async confirmSubscription(token: string): Promise<void> {
    const subscription = await this.subscriptionRepo.findOneByToken(token);

    if (!subscription) {
      throw new NotFoundException('Invalid or expired token');
    }

    subscription.confirmed = true;
    await this.subscriptionRepo.save(subscription);
  }

  @LogSubscription()
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
