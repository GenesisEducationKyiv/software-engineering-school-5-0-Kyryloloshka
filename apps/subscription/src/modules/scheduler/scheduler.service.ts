import { Inject, Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { Frequency } from '@lib/common/types/frequency';
import { ISchedulerService } from './interfaces/scheduler-service.interface';
import { Subscription } from '../subscription/entities/subscription.entity';
import { LoggedError } from '@lib/common/errors/logged.error';
import { LogMethod } from '@lib/common';
import { ISubscriptionService } from '../subscription/interfaces/subscription-service.interface';
import { ClientGrpc, ClientProxy } from '@nestjs/microservices';
import { WeatherResponse, WeatherServiceClient } from '@lib/common';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class SchedulerService implements ISchedulerService {
  private weatherService: WeatherServiceClient;

  constructor(
    @Inject('ISubscriptionService')
    private readonly subscriptionService: ISubscriptionService,
    @Inject('WEATHER_CLIENT')
    private readonly weatherClient: ClientGrpc,
    @Inject('NOTIFICATION_PUBLISHER')
    private readonly notificationPublisher: ClientProxy,
  ) {}

  onModuleInit() {
    this.weatherService =
      this.weatherClient.getService<WeatherServiceClient>('WeatherService');
  }

  @Cron('0 * * * *')
  async processHourly(): Promise<void> {
    await this.processByFrequency('hourly');
  }

  @Cron('0 9 * * *')
  async processDaily(): Promise<void> {
    await this.processByFrequency('daily');
  }

  private async processByFrequency(frequency: Frequency): Promise<void> {
    const subscriptions =
      await this.subscriptionService.findConfirmedByFrequency(frequency);

    for (const subscription of subscriptions) {
      await this.sendWeatherUpdate(subscription);
    }
  }

  @LogMethod({ context: 'SchedulerService' })
  private async sendWeatherUpdate(subscription: Subscription) {
    const weather = await lastValueFrom<WeatherResponse>(
      this.weatherService.GetWeather({ city: subscription.city }),
    );

    if (!weather) {
      throw new LoggedError(
        'warn',
        `No weather data for city: ${subscription.city}`,
      );
    }

    this.notificationPublisher.emit('send_weather_update', {
      email: subscription.email,
      token: subscription.token,
      city: subscription.city,
      weather,
    });

    throw new LoggedError(
      'log',
      `Weather update sent to ${subscription.email} (${subscription.city})`,
    );
  }
}
