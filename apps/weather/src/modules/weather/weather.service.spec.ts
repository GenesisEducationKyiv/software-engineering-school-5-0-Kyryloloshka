import { Test, TestingModule } from '@nestjs/testing';
import { WeatherService } from './weather.service';
import {
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { IWeatherService } from './interfaces/weather-service.interface';
import { IWeatherProvider } from './interfaces/weather-provider.interface';

describe('WeatherService', () => {
  let service: IWeatherService;
  let weatherProvider: jest.Mocked<IWeatherProvider>;

  beforeEach(async () => {
    weatherProvider = {
      providerName: 'MockWeatherProvider',
      getWeather: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WeatherService,
        {
          provide: 'IWeatherProvider',
          useValue: weatherProvider,
        },
      ],
    }).compile();

    service = module.get<WeatherService>(WeatherService);
    jest.clearAllMocks();
  });

  it('should return weather data for valid city', async () => {
    const city = 'Kyiv';
    const mappedResponse = {
      temperature: 10,
      humidity: 50,
      description: 'Cloudy',
    };

    weatherProvider.getWeather.mockResolvedValue(mappedResponse);

    const result = await service.getWeather({ city });

    expect(weatherProvider.getWeather).toHaveBeenCalledWith({ city });
    expect(result).toEqual(mappedResponse);
  });

  it('should throw NotFoundException if city not found', async () => {
    const city = 'UnknownCity';
    weatherProvider.getWeather.mockRejectedValue(new NotFoundException());

    await expect(service.getWeather({ city })).rejects.toThrow(
      NotFoundException,
    );
    expect(weatherProvider.getWeather).toHaveBeenCalledWith({ city });
  });

  it('should throw InternalServerErrorException if API key is missing', async () => {
    const city = 'Kyiv';
    weatherProvider.getWeather.mockRejectedValue(
      new InternalServerErrorException(),
    );

    await expect(service.getWeather({ city })).rejects.toThrow(
      InternalServerErrorException,
    );
    expect(weatherProvider.getWeather).toHaveBeenCalledWith({ city });
  });

  it('should throw InternalServerErrorException on unknown error', async () => {
    const city = 'Kyiv';
    weatherProvider.getWeather.mockRejectedValue(
      new InternalServerErrorException(),
    );

    await expect(service.getWeather({ city })).rejects.toThrow(
      InternalServerErrorException,
    );
    expect(weatherProvider.getWeather).toHaveBeenCalledWith({ city });
  });
});
