import { TransportOptions } from 'nodemailer';
import { join } from 'node:path';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';

export const emailSenderConfig = {
  transport: {
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT),
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  } as TransportOptions,
  defaults: {
    from: `"Weather App" <${process.env.EMAIL_USER}>`,
  },
  template: {
    dir: join(process.cwd(), 'public', 'email-templates'),
    adapter: new HandlebarsAdapter(),
    options: {
      strict: true,
    },
  },
};
