import { Injectable, Logger } from '@nestjs/common';
import Handlebars from 'handlebars';
import { createTransport } from 'nodemailer';
import path from 'path';
import { WeatherResponse } from 'src/common/types/weather';
import { promises as fs } from 'fs';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  private transporter = createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT),
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  private async compileTemplate(
    templateName: string,
    context: Record<string, any>,
  ): Promise<string> {
    const templatePath = path.join(
      __dirname,
      'templates',
      `${templateName}.hbs`,
    );
    const templateSource = await fs.readFile(templatePath, 'utf8');
    const template = Handlebars.compile(templateSource);
    return template(context);
  }

  async sendConfirmationEmail(email: string, token: string): Promise<void> {
    const confirmUrl = `${process.env.APP_URL}/confirm.html?token=${token}`;
    const html = await this.compileTemplate('confirm', { confirmUrl });

    const mailOptions = {
      from: `"Weather App" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Confirm your weather subscription',
      html,
    };

    try {
      await this.transporter.sendMail(mailOptions);
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

    const html = await this.compileTemplate('weather', {
      temperature: weather.temperature,
      humidity: weather.humidity,
      description: weather.description,
      unsubscribeUrl,
    });

    const mailOptions = {
      from: `"Weather App" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Here is your weather update ${city}`,
      html,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Confirmation email sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${email}`, error);
      throw new Error('Failed to send confirmation email');
    }
  }
}
