import { Injectable, Logger } from '@nestjs/common';
import { WeatherResponse } from 'src/common/types/weather';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(private readonly mailerService: MailerService) {}

  async sendConfirmationEmail(email: string, token: string): Promise<void> {
    const confirmUrl = `${process.env.APP_URL}/confirm.html?token=${token}`;

    const mailOptions = {
      to: email,
      template: 'confirm',
      subject: 'Confirm your weather subscription',
      context: {
        confirmUrl,
      },
    };

    try {
      await this.mailerService.sendMail(mailOptions);
      this.logger.log(`Confirmation email sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${email}`, error);
      throw new Error('Failed to send confirmation email');
    }
  }

  async sendWeatherUpdate({
    email,
    city,
    token,
    weather,
  }: {
    email: string;
    city: string;
    token: string;
    weather: WeatherResponse;
  }): Promise<void> {
    const unsubscribeUrl = `${process.env.APP_URL}/unsubscribe.html?token=${token}`;

    const mailOptions = {
      to: email,
      template: 'weather',
      subject: `Here is your weather update ${city}`,
      context: {
        temperature: weather.temperature,
        humidity: weather.humidity,
        description: weather.description,
        unsubscribeUrl,
      },
    };

    try {
      await this.mailerService.sendMail(mailOptions);
      this.logger.log(`Confirmation email sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${email}`, error);
      throw new Error('Failed to send confirmation email');
    }
  }
}
