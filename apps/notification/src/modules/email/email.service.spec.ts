import { Test, TestingModule } from '@nestjs/testing';
import { EmailService } from './email.service';
import { ConfigService } from '@nestjs/config';

describe('EmailService', () => {
  let service: EmailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              const config = {
                EMAIL_HOST: 'smtp.test.com',
                EMAIL_PORT: '587',
                EMAIL_USER: 'test@test.com',
                EMAIL_PASS: 'password',
                APP_URL: 'http://localhost:4200',
              };
              return config[key];
            }),
          },
        },
      ],
    }).compile();

    service = module.get<EmailService>(EmailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // Додаткові тести для sendConfirmationEmail та sendWeatherUpdate можна додати тут
});
