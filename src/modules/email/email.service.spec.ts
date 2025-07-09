import { Test, TestingModule } from '@nestjs/testing';
import { IEmailService } from './interfaces/email-service.interface';

describe('EmailService', () => {
  let service: IEmailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: 'IEmailService',
          useValue: {
            sendWeatherUpdate: jest.fn(),
            sendConfirmationEmail: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<IEmailService>('IEmailService');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
