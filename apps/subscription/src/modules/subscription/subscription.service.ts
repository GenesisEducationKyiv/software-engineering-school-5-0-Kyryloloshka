import { Injectable, Inject } from '@nestjs/common';
import { Subscription } from './entities/subscription.entity';
import { CreateSubscriptionDto } from '../../../../../libs/common/src/types/subscription/dto/create-subscription.dto';
import { ISubscriptionService } from './interfaces/subscription-service.interface';
import { LogMethod } from '@lib/common';
import { ISubscriptionRepository } from './interfaces/subscription-repository.interface';
import { Frequency } from '@lib/common/types/frequency';
import { ClientGrpc, ClientProxy } from '@nestjs/microservices';
import { Inject as InjectNest } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import {
  ConfirmSubscriptionDto,
  UnsubscribeDto,
  WEATHER_SERVICE_NAME,
  WeatherServiceClient,
  ErrorCodes,
} from '@lib/common';
import { generateToken } from '@lib/common/generators/token.generator';
import { RpcException } from '@nestjs/microservices';
import { MetricsService } from './metrics/metrics.service';

@Injectable()
export class SubscriptionService implements ISubscriptionService {
  private weatherService: WeatherServiceClient;

  constructor(
    @Inject('WEATHER_CLIENT')
    private readonly weatherClient: ClientGrpc,
    @Inject('ISubscriptionRepository')
    private readonly subscriptionRepo: ISubscriptionRepository,
    private readonly metricsService: MetricsService,
    @InjectNest('NOTIFICATION_PUBLISHER')
    private readonly notificationPublisher: ClientProxy,
  ) {}

  onModuleInit() {
    this.weatherService =
      this.weatherClient.getService<WeatherServiceClient>(WEATHER_SERVICE_NAME);
  }

  @LogMethod({ context: 'SubscriptionService' })
  async subscribe(dto: CreateSubscriptionDto): Promise<{ token: string }> {
    const existingSubscription = await this.subscriptionRepo.findOneByEmail(
      dto.email,
    );
    if (existingSubscription) {
      this.metricsService.errorCounter.inc();
      throw new RpcException(
        `${ErrorCodes.EMAIL_ALREADY_SUBSCRIBED}: Email already subscribed`,
      );
    }

    try {
      const weather = await lastValueFrom(
        this.weatherService.GetWeather({ city: dto.city }),
      );
      if (!weather || !weather.temperature) {
        this.metricsService.errorCounter.inc();
        throw new RpcException(
          `${ErrorCodes.WEATHER_UNAVAILABLE}: Weather for this city is not available`,
        );
      }
    } catch (error) {
      this.metricsService.errorCounter.inc();
      throw error;
    }

    const token = generateToken();

    await this.subscriptionRepo.createAndSave({
      ...dto,
      token,
    });

    this.notificationPublisher.emit('subscription_created', {
      email: dto.email,
      token,
    });

    this.metricsService.subscribeCounter.inc();
    return { token };
  }

  @LogMethod({ context: 'SubscriptionService' })
  async confirmSubscription(dto: ConfirmSubscriptionDto): Promise<void> {
    const subscription = await this.subscriptionRepo.findOneByToken(dto.token);

    if (!subscription) {
      this.metricsService.errorCounter.inc();
      throw new RpcException(
        `${ErrorCodes.INVALID_TOKEN}: Invalid or expired token`,
      );
    }

    subscription.confirmed = true;
    await this.subscriptionRepo.save(subscription);
    this.metricsService.confirmCounter.inc();
  }

  @LogMethod({ context: 'SubscriptionService' })
  async unsubscribe(dto: UnsubscribeDto): Promise<void> {
    const subscription = await this.subscriptionRepo.findOneByToken(dto.token);

    if (!subscription) {
      this.metricsService.errorCounter.inc();
      throw new RpcException(
        `${ErrorCodes.SUBSCRIPTION_NOT_FOUND}: Subscription not found or invalid token`,
      );
    }

    await this.subscriptionRepo.remove(subscription);
    this.metricsService.unsubscribeCounter.inc();
  }

  async findConfirmedByFrequency(
    frequency: Frequency,
  ): Promise<Subscription[]> {
    return this.subscriptionRepo.findConfirmedByFrequency(frequency);
  }
}
