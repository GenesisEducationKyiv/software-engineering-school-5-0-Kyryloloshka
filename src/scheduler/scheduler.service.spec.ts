import { Test, TestingModule } from '@nestjs/testing';
import { SchedulerService } from './scheduler.service';
import { SubscriptionService } from './../subscription/subscription.service';
import { WeatherService } from './../weather/weather.service';
import { EmailService } from './../email/email.service';

describe('SchedulerService', () => {
  let service: SchedulerService;

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

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
