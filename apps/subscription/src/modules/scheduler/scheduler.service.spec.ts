import { Test, TestingModule } from '@nestjs/testing';
import { SchedulerService } from './scheduler.service';
import { ISubscriptionService } from '../subscription/interfaces/subscription-service.interface';
import { IEmailService } from '../email/interfaces/email-service.interface';
import { of } from 'rxjs';
import { WeatherServiceClient } from '@lib/common';
import { LoggedError } from '@lib/common/errors/logged.error';

describe('SchedulerService', () => {
  let service: SchedulerService;
  let subSvc: jest.Mocked<ISubscriptionService>;
  let weatherSvc: jest.Mocked<WeatherServiceClient>;
  let emailSvc: jest.Mocked<IEmailService>;

  const mockSubSvc = (): jest.Mocked<ISubscriptionService> =>
    ({ findConfirmedByFrequency: jest.fn() }) as any;
  const mockEmailSvc = (): jest.Mocked<IEmailService> =>
    ({ sendWeatherUpdate: jest.fn() }) as any;

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
        { provide: 'IEmailService', useFactory: mockEmailSvc },
      ],
    }).compile();

    service = module.get(SchedulerService);
    subSvc = module.get('ISubscriptionService');
    emailSvc = module.get('IEmailService');
    service.onModuleInit();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should send weather updates to all confirmed daily subscriptions', async () => {
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
    expect(emailSvc.sendWeatherUpdate).toHaveBeenCalledTimes(1);
    expect(emailSvc.sendWeatherUpdate).toHaveBeenCalledWith({
      email: 'a@mail.com',
      city: 'Kyiv',
      token: 't1',
      weather: {
        temperature: 20,
        humidity: 50,
        description: 'Sunny',
      },
    });
  });

  it('should not send emails if no subscriptions found', async () => {
    subSvc.findConfirmedByFrequency.mockResolvedValue([]);
    await service.processDaily();
    expect(emailSvc.sendWeatherUpdate).not.toHaveBeenCalled();
  });

  it('should not send email if weather is not found', async () => {
    subSvc.findConfirmedByFrequency.mockResolvedValue([
      { id: 1, email: 'a@mail.com', city: 'Kyiv', token: 't1' },
    ] as any);
    weatherSvc.GetWeather.mockImplementationOnce(() => of(null));

    await expect(service.processDaily()).rejects.toThrow(LoggedError);

    expect(emailSvc.sendWeatherUpdate).not.toHaveBeenCalled();
  });
});
