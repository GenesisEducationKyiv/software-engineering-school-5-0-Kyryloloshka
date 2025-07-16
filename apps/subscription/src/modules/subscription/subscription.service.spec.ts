import { Test, TestingModule } from '@nestjs/testing';
import { SubscriptionService } from './subscription.service';
import { ISubscriptionRepository } from './interfaces/subscription-repository.interface';
import { Subscription } from './entities/subscription.entity';
import { Frequency } from '@lib/common/types/frequency';
import { of } from 'rxjs';
import { WeatherServiceClient } from '@lib/common';
import { MetricsService } from './metrics/metrics.service';

const repoMock = (): jest.Mocked<ISubscriptionRepository> => ({
  findOneByEmail: jest.fn(),
  findOneByToken: jest.fn(),
  createAndSave: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
  findConfirmedByFrequency: jest.fn(),
});

const notificationPublisherMock = () => ({
  emit: jest.fn().mockReturnValue({ toPromise: jest.fn() }),
});

describe('SubscriptionService', () => {
  let service: SubscriptionService;
  let repo: jest.Mocked<ISubscriptionRepository>;
  let notificationPublisher: { emit: jest.Mock };
  let weatherServiceMock: jest.Mocked<WeatherServiceClient>;

  beforeEach(async () => {
    weatherServiceMock = { GetWeather: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubscriptionService,
        { provide: 'ISubscriptionRepository', useFactory: repoMock },
        {
          provide: 'NOTIFICATION_PUBLISHER',
          useFactory: notificationPublisherMock,
        },
        {
          provide: 'WEATHER_CLIENT',
          useValue: {
            getService: () => weatherServiceMock,
          },
        },
        {
          provide: MetricsService,
          useValue: {
            errorCounter: { inc: jest.fn() },
            subscribeCounter: { inc: jest.fn() },
            confirmCounter: { inc: jest.fn() },
            unsubscribeCounter: { inc: jest.fn() },
          },
        },
      ],
    }).compile();

    service = module.get<SubscriptionService>(SubscriptionService);
    repo = module.get('ISubscriptionRepository');
    notificationPublisher = module.get('NOTIFICATION_PUBLISHER');
    service.onModuleInit?.();

    jest.clearAllMocks();

    weatherServiceMock.GetWeather.mockImplementation(() =>
      of({ temperature: 20, humidity: 80, description: 'Clear sky' }),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('subscribe', () => {
    it('should throw ConflictException if email already subscribed', async () => {
      repo.findOneByEmail.mockResolvedValueOnce({ id: 1 } as any);
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
      weatherServiceMock.GetWeather.mockImplementationOnce(() => of(null));
      await expect(
        service.subscribe({
          email: 'test@mail.com',
          city: 'Kyiv',
          frequency: 'daily',
        }),
      ).rejects.toThrow('Weather for this city is not available');
    });

    it('should save subscription and emit confirmation event', async () => {
      repo.findOneByEmail.mockResolvedValueOnce(null);
      weatherServiceMock.GetWeather.mockImplementationOnce(() =>
        of({ temperature: 20 } as any),
      );
      repo.createAndSave.mockResolvedValueOnce({ token: 'sometoken' } as any);

      const { token } = await service.subscribe({
        email: 'test@mail.com',
        city: 'Kyiv',
        frequency: 'daily',
      });

      expect(repo.createAndSave).toHaveBeenCalled();
      expect(notificationPublisher.emit).toHaveBeenCalledWith(
        'subscription_created',
        expect.objectContaining({
          email: 'test@mail.com',
          token: expect.any(String),
        }),
      );
      expect(typeof token).toBe('string');
    });

    it('should throw BadRequestException if weather.temperature is missing', async () => {
      repo.findOneByEmail.mockResolvedValueOnce(null);
      weatherServiceMock.GetWeather.mockImplementationOnce(() => of({} as any));
      await expect(
        service.subscribe({
          email: 'test2@mail.com',
          city: 'Lviv',
          frequency: 'daily',
        }),
      ).rejects.toThrow('Weather for this city is not available');
    });
  });

  describe('confirmSubscription', () => {
    it('should throw NotFoundException if token is invalid', async () => {
      repo.findOneByToken.mockResolvedValueOnce(null);
      await expect(
        service.confirmSubscription({ token: 'invalid-token' }),
      ).rejects.toThrow('Invalid or expired token');
    });

    it('should confirm subscription', async () => {
      const subscription = { confirmed: false } as Subscription;
      repo.findOneByToken.mockResolvedValueOnce(subscription);
      repo.save.mockResolvedValueOnce({} as any);
      await service.confirmSubscription({ token: 'valid-token' });
      expect(subscription.confirmed).toBe(true);
      expect(repo.save).toHaveBeenCalledWith(subscription);
    });
  });

  describe('unsubscribe', () => {
    it('should throw NotFoundException if token is invalid', async () => {
      repo.findOneByToken.mockResolvedValueOnce(null);
      await expect(service.unsubscribe({ token: 'bad-token' })).rejects.toThrow(
        'Subscription not found or invalid token',
      );
    });

    it('should remove subscription', async () => {
      const subscription = { id: 1 };
      repo.findOneByToken.mockResolvedValueOnce(subscription as any);
      repo.remove = jest.fn().mockResolvedValueOnce({});
      await service.unsubscribe({ token: 'good-token' });
      expect(repo.remove).toHaveBeenCalledWith(subscription);
    });
  });

  describe('findConfirmedByFrequency', () => {
    it('should return confirmed subscriptions by frequency', async () => {
      repo.findConfirmedByFrequency.mockResolvedValueOnce([
        { id: 1, confirmed: true, frequency: 'daily' } as any,
      ]);
      const result = await service.findConfirmedByFrequency(
        'daily' as Frequency,
      );
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

  describe('subscribe', () => {
    it('should throw BadRequestException if weather.temperature is missing', async () => {
      repo.findOneByEmail.mockResolvedValueOnce(null);
      weatherServiceMock.GetWeather.mockImplementationOnce(() => of({} as any));
      await expect(
        service.subscribe({
          email: 'test2@mail.com',
          city: 'Lviv',
          frequency: 'daily',
        }),
      ).rejects.toThrow('Weather for this city is not available');
    });
  });

  describe('confirmSubscription', () => {
    it('should not call save if subscription not found', async () => {
      repo.findOneByToken.mockResolvedValueOnce(null);
      repo.save = jest.fn();
      await expect(
        service.confirmSubscription({ token: 'bad-token' }),
      ).rejects.toThrow('Invalid or expired token');
      expect(repo.save).not.toHaveBeenCalled();
    });

    it('should set confirmed to true and save', async () => {
      const subscription = { confirmed: false } as Subscription;
      repo.findOneByToken.mockResolvedValueOnce(subscription);
      repo.save.mockResolvedValueOnce({} as any);
      await service.confirmSubscription({ token: 'valid-token' });
      expect(subscription.confirmed).toBe(true);
      expect(repo.save).toHaveBeenCalledWith(subscription);
    });
  });
});
