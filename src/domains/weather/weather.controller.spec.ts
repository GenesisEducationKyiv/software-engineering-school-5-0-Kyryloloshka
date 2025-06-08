import { Test, TestingModule } from '@nestjs/testing';
import { WeatherController } from './weather.controller';
import { WeatherService } from './weather.service';
import { ConfigService } from '@nestjs/config';
import { GetWeatherDto } from './dto/get-weather.dto';
import { BadRequestException } from '@nestjs/common';

const configMock = () => ({
  get: jest.fn().mockReturnValue('dummy-key'),
});

const weatherServiceMock = () => ({
  getWeather: jest.fn((city) => {
    return {
      temperature: 25,
      humidity: 60,
      description: `Sunny ${city}`,
    };
  }),
});

describe('WeatherController', () => {
  let controller: WeatherController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WeatherController],
      providers: [
        { provide: WeatherService, useFactory: weatherServiceMock },
        { provide: ConfigService, useFactory: configMock },
      ],
    }).compile();

    controller = module.get<WeatherController>(WeatherController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
  it('should throw BadRequestException when city is missing', async () => {
    const dto = {} as GetWeatherDto;

    await expect(controller.getWeather(dto)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('should return weather data when city is provided', async () => {
    expect(await controller.getWeather({ city: 'Kyiv' })).toEqual({
      temperature: expect.any(Number),
      humidity: expect.any(Number),
      description: expect.any(String),
    });
  });
});
