import { Test, TestingModule } from '@nestjs/testing';
import { SchedulerService } from './scheduler.service';
import { SubscriptionService } from 'src/subscription/subscription.service';
import { WeatherService } from 'src/weather/weather.service';
import { EmailService } from 'src/email/email.service';

describe('SchedulerService', () => {
  let service: SchedulerService;
  let subSvc: jest.Mocked<SubscriptionService>;
  let weatherSvc: jest.Mocked<WeatherService>;
  let emailSvc: jest.Mocked<EmailService>;

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

  function mockSubSvc(): Partial<jest.Mocked<SubscriptionService>> {
    return {
      findConfirmedByFrequency: jest.fn(),
    };
  }
  function mockWeatherSvc(): Partial<jest.Mocked<WeatherService>> {
    return { getWeather: jest.fn() };
  }
  function mockEmailSvc(): Partial<jest.Mocked<EmailService>> {
    return { sendWeatherUpdate: jest.fn() };
  }

  it('processHourly() delegates to processByFrequency("hourly")', async () => {
    const spy = jest
      .spyOn<any, any>(service, 'processByFrequency')
      .mockResolvedValue(undefined);
    await service.processHourly();
    expect(spy).toHaveBeenCalledWith('hourly');
  });

  it('processDaily() delegates to processByFrequency("daily")', async () => {
    const spy = jest
      .spyOn<any, any>(service, 'processByFrequency')
      .mockResolvedValue(undefined);
    await service.processDaily();
    expect(spy).toHaveBeenCalledWith('daily');
  });

  it('does nothing if no subscriptions found', async () => {
    subSvc.findConfirmedByFrequency.mockResolvedValue([]);
    await service['processByFrequency']('hourly' as any);

    expect(weatherSvc.getWeather).not.toHaveBeenCalled();
    expect(emailSvc.sendWeatherUpdate).not.toHaveBeenCalled();
  });

  it('sends weather e-mails for every subscription', async () => {
    const mockSubs = [
      { email: 'a@test.com', city: 'Kyiv', frequency: 'hourly', token: 't1' },
      { email: 'b@test.com', city: 'Lviv', frequency: 'hourly', token: 't2' },
    ] as any;

    subSvc.findConfirmedByFrequency.mockResolvedValue(mockSubs);
    weatherSvc.getWeather.mockResolvedValue({
      temperature: 1,
      humidity: 2,
      description: 'sunny',
    });

    await service['processByFrequency']('hourly' as any);

    // перевірили, що для кожної підписки зробили 1 API-виклик погоди
    expect(weatherSvc.getWeather).toHaveBeenCalledTimes(mockSubs.length);
    expect(weatherSvc.getWeather).toHaveBeenCalledWith({ city: 'Kyiv' });
    expect(weatherSvc.getWeather).toHaveBeenCalledWith({ city: 'Lviv' });

    // і 1 email
    expect(emailSvc.sendWeatherUpdate).toHaveBeenCalledTimes(mockSubs.length);
    expect(emailSvc.sendWeatherUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'a@test.com', city: 'Kyiv' }),
    );
  });

  it('continues processing if one send fails', async () => {
    const sub = {
      email: 'err@test.com',
      city: 'Odesa',
      frequency: 'hourly',
      token: 'x',
    } as any;
    subSvc.findConfirmedByFrequency.mockResolvedValue([sub]);

    weatherSvc.getWeather.mockRejectedValue(new Error('API down'));

    await expect(
      service['processByFrequency']('hourly' as any),
    ).resolves.not.toThrow();

    // виклик emailService не відбувся, але сервіс не впав
    expect(emailSvc.sendWeatherUpdate).not.toHaveBeenCalled();
  });
});
