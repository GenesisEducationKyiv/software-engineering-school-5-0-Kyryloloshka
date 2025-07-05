import { Test, TestingModule } from '@nestjs/testing';
import { SubscriptionService } from './subscription.service';
import { EmailService } from '../email/email.service';
import { SubscriptionRepository } from './subscription.repository';
import { WeatherService } from '../weather/weather.service';

const repoMock = () => ({
  findOneByEmail: jest.fn(),
  findOneByToken: jest.fn(),
  createAndSave: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
  findConfirmedByFrequency: jest.fn(),
});
const emailMock = () => ({
  sendConfirmationEmail: jest.fn(),
});

const weatherServiceMock = {
  getWeather: jest.fn(),
};

describe('SubscriptionService', () => {
  let service: SubscriptionService;
  let repo: ReturnType<typeof repoMock>;
  let email: ReturnType<typeof emailMock>;
  let weather: typeof weatherServiceMock;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubscriptionService,
        { provide: SubscriptionRepository, useFactory: repoMock },
        { provide: EmailService, useFactory: emailMock },
        { provide: WeatherService, useValue: weatherServiceMock },
      ],
    }).compile();

    service = module.get<SubscriptionService>(SubscriptionService);
    repo = module.get(SubscriptionRepository);
    email = module.get(EmailService);
    weather = module.get(WeatherService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('subscribe', () => {
    it('should throw ConflictException if email already subscribed', async () => {
      repo.findOneByEmail.mockResolvedValueOnce({ id: 1 });
      await expect(
        service.subscribe({
          email: 'test@mail.com',
          city: 'Kyiv',
          frequency: 'daily',
        }),
      ).rejects.toThrow('Email already subscribed');
    });

    it('should throw BadRequestException if weather is invalid', async () => {
      repo.findOneByEmail.mockResolvedValueOnce(null);
      weather.getWeather.mockResolvedValueOnce(null);
      await expect(
        service.subscribe({
          email: 'test@mail.com',
          city: 'Kyiv',
          frequency: 'daily',
        }),
      ).rejects.toThrow('Invalid input');
    });

    it('should save subscription and send confirmation email', async () => {
      repo.findOneByEmail.mockResolvedValueOnce(null);
      weather.getWeather.mockResolvedValueOnce({ temperature: 20 });
      repo.createAndSave.mockResolvedValueOnce({ token: 'sometoken' });
      email.sendConfirmationEmail.mockResolvedValueOnce(undefined);

      const { token } = await service.subscribe({
        email: 'test@mail.com',
        city: 'Kyiv',
        frequency: 'daily',
      });

      expect(repo.createAndSave).toHaveBeenCalled();
      expect(email.sendConfirmationEmail).toHaveBeenCalledWith(
        'test@mail.com',
        expect.any(String),
      );
      expect(typeof token).toBe('string');
    });
  });

  describe('confirmSubscription', () => {
    it('should throw NotFoundException if token is invalid', async () => {
      repo.findOneByToken.mockResolvedValueOnce(null);
      await expect(
        service.confirmSubscription('invalid-token'),
      ).rejects.toThrow('Invalid or expired token');
    });

    it('should confirm subscription', async () => {
      const subscription = { confirmed: false };
      repo.findOneByToken.mockResolvedValueOnce(subscription);
      repo.save.mockResolvedValueOnce({});
      await service.confirmSubscription('valid-token');
      expect(subscription.confirmed).toBe(true);
      expect(repo.save).toHaveBeenCalledWith(subscription);
    });
  });

  describe('unsubscribe', () => {
    it('should throw NotFoundException if token is invalid', async () => {
      repo.findOneByToken.mockResolvedValueOnce(null);
      await expect(service.unsubscribe('bad-token')).rejects.toThrow(
        'Subscription not found or invalid token',
      );
    });

    it('should remove subscription', async () => {
      const subscription = { id: 1 };
      repo.findOneByToken.mockResolvedValueOnce(subscription);
      repo.remove = jest.fn().mockResolvedValueOnce({});
      await service.unsubscribe('good-token');
      expect(repo.remove).toHaveBeenCalledWith(subscription);
    });
  });

  describe('findConfirmedByFrequency', () => {
    it('should return confirmed subscriptions by frequency', async () => {
      repo.findConfirmedByFrequency.mockResolvedValueOnce([
        { id: 1, confirmed: true, frequency: 'daily' },
      ]);
      const result = await service.findConfirmedByFrequency('daily' as any);
      expect(result).toEqual([{ id: 1, confirmed: true, frequency: 'daily' }]);
      expect(repo.findConfirmedByFrequency).toHaveBeenCalledWith('daily');
    });

    it('should return empty array if no subscriptions found', async () => {
      repo.findConfirmedByFrequency.mockResolvedValueOnce([]);
      const result = await service.findConfirmedByFrequency('weekly' as any);
      expect(result).toEqual([]);
      expect(repo.findConfirmedByFrequency).toHaveBeenCalledWith('weekly');
    });
  });

  // Additional tests for edge cases and error handling

  describe('subscribe', () => {
    it('should throw BadRequestException if weather.temperature is missing', async () => {
      repo.findOneByEmail.mockResolvedValueOnce(null);
      weather.getWeather.mockResolvedValueOnce({});
      await expect(
        service.subscribe({
          email: 'test2@mail.com',
          city: 'Lviv',
          frequency: 'daily',
        }),
      ).rejects.toThrow('Invalid input');
    });
  });

  describe('confirmSubscription', () => {
    it('should not call save if subscription not found', async () => {
      repo.findOneByToken.mockResolvedValueOnce(null);
      repo.save = jest.fn();
      await expect(service.confirmSubscription('bad-token')).rejects.toThrow(
        'Invalid or expired token',
      );
      expect(repo.save).not.toHaveBeenCalled();
    });

    it('should set confirmed to true and save', async () => {
      const subscription = { confirmed: false };
      repo.findOneByToken.mockResolvedValueOnce(subscription);
      repo.save.mockResolvedValueOnce({});
      await service.confirmSubscription('token');
      expect(subscription.confirmed).toBe(true);
      expect(repo.save).toHaveBeenCalledWith(subscription);
    });
  });
});
