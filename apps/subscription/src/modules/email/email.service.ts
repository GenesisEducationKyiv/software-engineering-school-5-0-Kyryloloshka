import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Handlebars from 'handlebars';
import { createTransport } from 'nodemailer';
import * as path from 'path';
import { WeatherResponse } from '@lib/common/types/weather/weather';
import { promises as fs } from 'fs';
import { LogSendEmail } from './decorators/log-send-email.decorator';
import { IEmailService } from './interfaces/email-service.interface';

@Injectable()
export class EmailService implements IEmailService {
  private transporter;
  private appUrl: string;
  private emailUser: string;

  constructor(private readonly configService: ConfigService) {
    this.transporter = createTransport({
      host: this.configService.get<string>('EMAIL_HOST'),
      port: parseInt(this.configService.get<string>('EMAIL_PORT')),
      secure: false,
      auth: {
        user: this.configService.get<string>('EMAIL_USER'),
        pass: this.configService.get<string>('EMAIL_PASS'),
      },
    });
    this.appUrl = this.configService.get<string>('APP_URL');
    this.emailUser = this.configService.get<string>('EMAIL_USER');
  }

  private async compileTemplate(
    templateName: string,
    context: Record<string, any>,
  ): Promise<string> {
    const templatePath = path.join(
      process.cwd(),
      'public',
      'email-templates',
      `${templateName}.hbs`,
    );
    const templateSource = await fs.readFile(templatePath, 'utf8');
    const template = Handlebars.compile(templateSource);
    return template(context);
  }

  @LogSendEmail()
  async sendConfirmationEmail(email: string, token: string): Promise<void> {
    const confirmUrl = `${this.appUrl}/confirm.html?token=${token}`;
    const html = await this.compileTemplate('confirm', { confirmUrl });

    const mailOptions = {
      from: `"Weather App" <${this.emailUser}>`,
      to: email,
      subject: 'Confirm your weather subscription',
      html,
    };

    await this.transporter.sendMail(mailOptions);
  }

  @LogSendEmail()
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
    const unsubscribeUrl = `${this.appUrl}/unsubscribe.html?token=${token}`;

    const html = await this.compileTemplate('weather', {
      temperature: weather.temperature,
      humidity: weather.humidity,
      description: weather.description,
      unsubscribeUrl,
    });

    console.log(html);

    const mailOptions = {
      from: `"Weather App" <${this.emailUser}>`,
      to: email,
      subject: `Here is your weather update ${city}`,
      html,
    };

    await this.transporter.sendMail(mailOptions);
  }
}
