import { Inject, Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { Frequency } from 'src/common/types/frequency';
import { ISchedulerService } from './interfaces/scheduler-service.interface';
import { Subscription } from '../subscription/entities/subscription.entity';
import { LoggedError } from 'src/common/errors/logged.error';
import { LogSendUpdate } from './decorators/log-send-update.decorator';
import { IWeatherService } from '../weather/interfaces/weather-service.interface';
import { IEmailService } from '../email/interfaces/email-service.interface';
import { ISubscriptionService } from '../subscription/interfaces/subscription-service.interface';

@Injectable()
export class SchedulerService implements ISchedulerService {
  constructor(
    @Inject('ISubscriptionService')
    private readonly subscriptionService: ISubscriptionService,
    @Inject('IWeatherService')
    private readonly weatherService: IWeatherService,
    @Inject('IEmailService')
    private readonly emailService: IEmailService,
  ) {}

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
      this.sendWeatherUpdate(subscription);
    }
  }

  @LogSendUpdate()
  private async sendWeatherUpdate(subscription: Subscription) {
    const weather = await this.weatherService.getWeather({
      city: subscription.city,
    });

    if (!weather) {
      throw new LoggedError(
        'warn',
        `No weather data for city: ${subscription.city}`,
      );
    }

    await this.emailService.sendWeatherUpdate({
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
