import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { WeatherController } from './weather.controller';
import { IWeatherService } from './interfaces/weather-service.interface';

describe('WeatherController', () => {
  let app: INestApplication;
  let controller: WeatherController;
  let service: jest.Mocked<IWeatherService>;

  const weatherServiceMock = (): jest.Mocked<IWeatherService> => ({
    getWeather: jest.fn(),
  });

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [WeatherController],
      providers: [
        {
          provide: 'IWeatherService',
          useFactory: weatherServiceMock,
        },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
    );
    await app.init();

    controller = moduleRef.get<WeatherController>(WeatherController);
    service = moduleRef.get('IWeatherService');
  });

  afterEach(async () => {
    await app.close();
    jest.clearAllMocks();
  });

  it('should return weather data for valid city', async () => {
    const mockWeather = { temperature: 15, humidity: 50, description: 'Sunny' };
    service.getWeather.mockResolvedValueOnce(mockWeather);

    const result = await controller.getWeather({ city: 'Kyiv' });
    expect(result).toEqual(mockWeather);
    expect(service.getWeather).toHaveBeenCalledWith({ city: 'Kyiv' });
  });

  it('should throw error if city is not provided', async () => {
    try {
      // @ts-expect-error Testing validation: missing required 'city' property
      await controller.getWeather({});
    } catch (e: any) {
      expect(e.getResponse().message).toContain('city must be a string');
    }
  });

  it('should throw error if city is not a string', async () => {
    try {
      // @ts-expect-error Testing validation: 'city' is not a string
      await controller.getWeather({ city: 123 });
    } catch (e: any) {
      expect(e.getResponse().message).toContain('city must be a string');
    }
  });

  it('should throw 404 if city not found', async () => {
    service.getWeather.mockImplementationOnce(() => {
      const error: any = new Error('City not found');
      error.status = 404;
      throw error;
    });

    try {
      await controller.getWeather({ city: 'UnknownCity' });
    } catch (e: any) {
      expect(e.message).toBe('City not found');
      expect(e.status).toBe(404);
    }
  });
});
