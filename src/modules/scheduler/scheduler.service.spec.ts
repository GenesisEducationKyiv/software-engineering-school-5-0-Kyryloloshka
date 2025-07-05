import { Test, TestingModule } from '@nestjs/testing';
import { SchedulerService } from './scheduler.service';
import { SubscriptionService } from '../subscription/subscription.service';
import { WeatherService } from '../weather/weather.service';
import { EmailService } from '../email/email.service';

describe('SchedulerService', () => {
  let service: SchedulerService;
  let subSvc: jest.Mocked<SubscriptionService>;
  let weatherSvc: jest.Mocked<WeatherService>;
  let emailSvc: jest.Mocked<EmailService>;

  const mockSubSvc = (): jest.Mocked<SubscriptionService> =>
    ({ findConfirmedByFrequency: jest.fn() }) as any;
  const mockWeatherSvc = (): jest.Mocked<WeatherService> =>
    ({ getWeather: jest.fn() }) as any;
  const mockEmailSvc = (): jest.Mocked<EmailService> =>
    ({ sendWeatherUpdate: jest.fn() }) as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SchedulerService,
        { provide: SubscriptionService, useValue: mockSubSvc() },
        { provide: WeatherService, useValue: mockWeatherSvc() },
        { provide: EmailService, useValue: mockEmailSvc() },
      ],
    }).compile();

    service = module.get(SchedulerService);
    subSvc = module.get(SubscriptionService);
    weatherSvc = module.get(WeatherService);
    emailSvc = module.get(EmailService);
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
