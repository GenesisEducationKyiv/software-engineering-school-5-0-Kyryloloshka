import { TransportOptions } from 'nodemailer';
import { join } from 'path';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { ConfigService } from '@nestjs/config';

export const emailSenderConfigFactory = (configService: ConfigService) => ({
  transport: {
    host: configService.get<string>('EMAIL_HOST'),
    port: parseInt(configService.get<string>('EMAIL_PORT')),
    secure: false,
    auth: {
      user: configService.get<string>('EMAIL_USER'),
      pass: configService.get<string>('EMAIL_PASS'),
    },
  } as TransportOptions,
  defaults: {
    from: `"Weather App" <${configService.get<string>('EMAIL_USER')}>`,
  },
  template: {
    dir: join(process.cwd(), 'public', 'email-templates'),
    adapter: new HandlebarsAdapter(),
    options: {
      strict: true,
    },
  },
});
