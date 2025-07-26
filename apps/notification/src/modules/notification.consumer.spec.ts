import { Test, TestingModule } from '@nestjs/testing';
import { NotificationConsumer } from './notification.consumer';
import { EmailService } from './email/email.service';

describe('NotificationConsumer', () => {
  let consumer: NotificationConsumer;
  let emailService: EmailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationConsumer,
        {
          provide: EmailService,
          useValue: {
            sendConfirmationEmail: jest.fn(),
          },
        },
      ],
    }).compile();

    consumer = module.get<NotificationConsumer>(NotificationConsumer);
    emailService = module.get<EmailService>(EmailService);
  });

  it('should be defined', () => {
    expect(consumer).toBeDefined();
  });

  it('should call emailService.sendConfirmationEmail on event', async () => {
    const data = { email: 'test@test.com', token: '123' };
    await consumer.handleSubscriptionCreated(data);
    expect(emailService.sendConfirmationEmail).toHaveBeenCalledWith(
      'test@test.com',
      '123',
    );
  });
});
