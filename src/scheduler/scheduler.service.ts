import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { SubscriptionService } from 'src/subscription/subscription.service';
import { WeatherService } from 'src/weather/weather.service';
import { EmailService } from 'src/email/email.service';
import { Frequency } from 'src/common/types/frequency';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(
    private readonly subscriptionService: SubscriptionService,
    private readonly weatherService: WeatherService,
    private readonly emailService: EmailService,
  ) {}

  @Cron('0 * * * *')
  async processHourly(): Promise<void> {
    await this.processByFrequency('hourly');
  }

  @Cron('0 9 * * *')
  async processDaily(): Promise<void> {
    await this.processByFrequency('daily');
  }

  private async processByFrequency(frequency: Frequency) {
    const subscriptions =
      await this.subscriptionService.findConfirmedByFrequency(frequency);
    if (!subscriptions.length) return;

    for (const subscription of subscriptions) {
      try {
        const weather = await this.weatherService.getWeather({
          city: subscription.city,
        });

        await this.emailService.sendWeatherUpdate({
          email: subscription.email,
          token: subscription.token,
          city: subscription.city,
          weather,
        });
      } catch (err: any) {
        this.logger.error(
          `Failed to send weather to ${subscription.email} (${subscription.city})`,
          err as any,
        );
      }
    }
  }
}
