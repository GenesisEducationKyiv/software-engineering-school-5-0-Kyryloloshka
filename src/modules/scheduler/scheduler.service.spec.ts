import { Test, TestingModule } from '@nestjs/testing';
import { SchedulerService } from './scheduler.service';
import { ISubscriptionService } from '../subscription/interfaces/subscription-service.interface';
import { IWeatherService } from '../weather/interfaces/weather-service.interface';
import { IEmailService } from '../email/interfaces/email-service.interface';

describe('SchedulerService', () => {
  let service: SchedulerService;
  let subSvc: jest.Mocked<ISubscriptionService>;
  let weatherSvc: jest.Mocked<IWeatherService>;
  let emailSvc: jest.Mocked<IEmailService>;

  const mockSubSvc = (): jest.Mocked<ISubscriptionService> =>
    ({ findConfirmedByFrequency: jest.fn() }) as any;
  const mockWeatherSvc = (): jest.Mocked<IWeatherService> =>
    ({ getWeather: jest.fn() }) as any;
  const mockEmailSvc = (): jest.Mocked<IEmailService> =>
    ({ sendWeatherUpdate: jest.fn() }) as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SchedulerService,
        { provide: 'ISubscriptionService', useFactory: mockSubSvc },
        { provide: 'IWeatherService', useFactory: mockWeatherSvc },
        { provide: 'IEmailService', useFactory: mockEmailSvc },
      ],
    }).compile();

    service = module.get(SchedulerService);
    subSvc = module.get('ISubscriptionService');
    weatherSvc = module.get('IWeatherService');
    emailSvc = module.get('IEmailService');
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
    weatherSvc.getWeather.mockResolvedValue({
      temperature: 20,
      humidity: 50,
      description: 'Sunny',
    });

    await service.processDaily();

    expect(subSvc.findConfirmedByFrequency).toHaveBeenCalledWith('daily');
    expect(weatherSvc.getWeather).toHaveBeenCalledTimes(2);
    expect(emailSvc.sendWeatherUpdate).toHaveBeenCalledTimes(2);
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
    expect(emailSvc.sendWeatherUpdate).toHaveBeenCalledWith({
      email: 'b@mail.com',
      city: 'Lviv',
      token: 't2',
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
    weatherSvc.getWeather.mockResolvedValue(null);

    await service.processDaily();

    expect(emailSvc.sendWeatherUpdate).not.toHaveBeenCalled();
  });
});
