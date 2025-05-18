// src/scheduler/weather.scheduler.ts
import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { SubscriptionService } from 'src/subscription/subscription.service';
import { WeatherService } from 'src/weather/weather.service';
import { EmailService } from 'src/email/email.service';

@Injectable()
export class SchedulerService {
  private readonly log = new Logger(SchedulerService.name);

  constructor(
    private readonly subService: SubscriptionService,
    private readonly weatherService: WeatherService,
    private readonly emailService: EmailService,
  ) {}

  @Cron('12 * * * *')
  async processHourly(): Promise<void> {
    await this.processByFrequency('hourly');
  }

  @Cron('0 9 * * *')
  async processDaily(): Promise<void> {
    await this.processByFrequency('daily');
  }

  private async processByFrequency(freq: 'hourly' | 'daily') {
    const subs = await this.subService.findConfirmedByFrequency(freq);
    if (!subs.length) return;

    this.log.log(`Processing ${subs.length} ${freq} subs`);

    for (const sub of subs) {
      try {
        const weather = await this.weatherService.getWeather({
          city: sub.city,
        });
        console.log(`Weather for ${sub.city}:`, weather);

        await this.emailService.sendWeatherUpdate({
          email: sub.email,
          token: sub.token,
          city: sub.city,
          weather,
        });
      } catch (err: any) {
        this.log.error(
          `Failed to send weather to ${sub.email} (${sub.city})`,
          err as any,
        );
      }
    }
  }
}
