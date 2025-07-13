import {
  Injectable,
  ConflictException,
  BadRequestException,
  NotFoundException,
  Inject,
} from '@nestjs/common';
import { Subscription } from './entities/subscription.entity';
import { CreateSubscriptionDto } from '../../../../../libs/common/src/types/subscription/dto/create-subscription.dto';
import { ISubscriptionService } from './interfaces/subscription-service.interface';
import { LogSubscription } from './decorators/log-subscription.decorator';
import { IEmailService } from '../email/interfaces/email-service.interface';
import { ISubscriptionRepository } from './interfaces/subscription-repository.interface';
import { Frequency } from '@lib/common/types/frequency';
import { ClientGrpc } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import {
  ConfirmSubscriptionDto,
  UnsubscribeDto,
  WEATHER_SERVICE_NAME,
  WeatherServiceClient,
} from '@lib/common';
import { generateToken } from '@lib/common/generators/token.generator';

@Injectable()
export class SubscriptionService implements ISubscriptionService {
  private weatherService: WeatherServiceClient;

  constructor(
    @Inject('IEmailService')
    private readonly emailService: IEmailService,
    @Inject('WEATHER_CLIENT')
    private readonly weatherClient: ClientGrpc,
    @Inject('ISubscriptionRepository')
    private readonly subscriptionRepo: ISubscriptionRepository,
  ) {}

  onModuleInit() {
    this.weatherService =
      this.weatherClient.getService<WeatherServiceClient>(WEATHER_SERVICE_NAME);
  }

  @LogSubscription()
  async subscribe(dto: CreateSubscriptionDto): Promise<{ token: string }> {
    const existingSubscription = await this.subscriptionRepo.findOneByEmail(
      dto.email,
    );
    if (existingSubscription) {
      throw new ConflictException('Email already subscribed');
    }

    const weather = await lastValueFrom(
      this.weatherService.getWeather({ city: dto.city }),
    );
    if (!weather || !weather.temperature) {
      throw new BadRequestException('Weather for this city is not available');
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
  async confirmSubscription(dto: ConfirmSubscriptionDto): Promise<void> {
    const subscription = await this.subscriptionRepo.findOneByToken(dto.token);

    if (!subscription) {
      throw new NotFoundException('Invalid or expired token');
    }

    subscription.confirmed = true;
    await this.subscriptionRepo.save(subscription);
  }

  @LogSubscription()
  async unsubscribe(dto: UnsubscribeDto): Promise<void> {
    const subscription = await this.subscriptionRepo.findOneByToken(dto.token);

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
