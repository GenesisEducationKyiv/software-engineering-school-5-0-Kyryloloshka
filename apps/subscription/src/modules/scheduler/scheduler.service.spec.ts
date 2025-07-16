import { Test, TestingModule } from '@nestjs/testing';
import { SchedulerService } from './scheduler.service';
import { ISubscriptionService } from '../subscription/interfaces/subscription-service.interface';
import { of } from 'rxjs';
import { WeatherServiceClient } from '@lib/common';
import { LoggedError } from '@lib/common/errors/logged.error';

describe('SchedulerService', () => {
  let service: SchedulerService;
  let subSvc: jest.Mocked<ISubscriptionService>;
  let weatherSvc: jest.Mocked<WeatherServiceClient>;
  let notificationPublisher: { emit: jest.Mock };

  const mockSubSvc = (): jest.Mocked<ISubscriptionService> =>
    ({ findConfirmedByFrequency: jest.fn() }) as any;
  const notificationPublisherMock = () => ({
    emit: jest.fn().mockReturnValue({ toPromise: jest.fn() }),
  });

  beforeEach(async () => {
    weatherSvc = { GetWeather: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SchedulerService,
        { provide: 'ISubscriptionService', useFactory: mockSubSvc },
        {
          provide: 'WEATHER_CLIENT',
          useValue: {
            getService: () => weatherSvc,
          },
        },
        {
          provide: 'NOTIFICATION_PUBLISHER',
          useFactory: notificationPublisherMock,
        },
      ],
    }).compile();

    service = module.get(SchedulerService);
    subSvc = module.get('ISubscriptionService');
    notificationPublisher = module.get('NOTIFICATION_PUBLISHER');
    service.onModuleInit();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should emit weather update event for all confirmed daily subscriptions', async () => {
    const subscriptions = [
      { id: 1, email: 'a@mail.com', city: 'Kyiv', token: 't1' },
      { id: 2, email: 'b@mail.com', city: 'Lviv', token: 't2' },
    ];
    subSvc.findConfirmedByFrequency.mockResolvedValue(subscriptions as any);

    weatherSvc.GetWeather.mockImplementation(() =>
      of({
        temperature: 20,
        humidity: 50,
        description: 'Sunny',
      }),
    );

    await expect(service.processDaily()).rejects.toThrow(LoggedError);

    expect(subSvc.findConfirmedByFrequency).toHaveBeenCalledWith('daily');
    expect(weatherSvc.GetWeather).toHaveBeenCalledTimes(1);
    expect(notificationPublisher.emit).toHaveBeenCalledTimes(1);
    expect(notificationPublisher.emit).toHaveBeenCalledWith(
      'send_weather_update',
      expect.objectContaining({
        email: 'a@mail.com',
        city: 'Kyiv',
        token: 't1',
        weather: expect.objectContaining({
          temperature: 20,
          humidity: 50,
          description: 'Sunny',
        }),
      }),
    );
  });

  it('should not emit event if no subscriptions found', async () => {
    subSvc.findConfirmedByFrequency.mockResolvedValue([]);
    await service.processDaily();
    expect(notificationPublisher.emit).not.toHaveBeenCalled();
  });

  it('should not emit event if weather is not found', async () => {
    subSvc.findConfirmedByFrequency.mockResolvedValue([
      { id: 1, email: 'a@mail.com', city: 'Kyiv', token: 't1' },
    ] as any);
    weatherSvc.GetWeather.mockImplementationOnce(() => of(null));

    await expect(service.processDaily()).rejects.toThrow(LoggedError);

    expect(notificationPublisher.emit).not.toHaveBeenCalled();
  });
});
