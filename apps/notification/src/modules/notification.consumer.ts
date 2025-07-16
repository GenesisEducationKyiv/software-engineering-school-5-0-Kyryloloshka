import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { EmailService } from './email/email.service';
import { WeatherResponse } from '@lib/common';

@Controller()
export class NotificationConsumer {
  constructor(private readonly emailService: EmailService) {}

  @EventPattern('subscription_created')
  async handleSubscriptionCreated(
    @Payload() data: { email: string; token: string },
  ) {
    const { email, token } = data;
    await this.emailService.sendConfirmationEmail(email, token);
  }

  @EventPattern('send_weather_update')
  async handleSendWeatherUpdate(
    @Payload()
    data: {
      email: string;
      token: string;
      city: string;
      weather: WeatherResponse;
    },
  ) {
    await this.emailService.sendWeatherUpdate(data);
  }
}
