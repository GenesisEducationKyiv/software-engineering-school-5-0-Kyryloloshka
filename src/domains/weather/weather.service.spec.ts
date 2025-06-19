import { Test, TestingModule } from '@nestjs/testing';
import { WeatherService } from './weather.service';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import {
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { of, throwError } from 'rxjs';
import { AxiosResponse, AxiosError } from 'axios';
import { mapToWeatherResponse } from 'src/common/mappers/weather.mapper';

jest.mock('src/common/mappers/weather.mapper', () => ({
  mapToWeatherResponse: jest.fn(),
}));

describe('WeatherService (integration)', () => {
  let service: WeatherService;
  let httpService: HttpService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WeatherService,
        {
          provide: HttpService,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<WeatherService>(WeatherService);
    httpService = module.get<HttpService>(HttpService);
    configService = module.get<ConfigService>(ConfigService);
    jest.clearAllMocks();
  });

  it('should return weather data for valid city', async () => {
    const apiKey = 'test-api-key';
    const city = 'Kyiv';
    const url = `${process.env.WEATHER_BASE_API_URL}/current.json?key=${apiKey}&q=${encodeURIComponent(city)}`;
    const mockApiResponse = {
      data: { temp: 10, humidity: 50, weather: 'Cloudy' },
    } as AxiosResponse;
    const mappedResponse = {
      temperature: 10,
      humidity: 50,
      description: 'Cloudy',
    };

    (configService.get as jest.Mock).mockReturnValue(apiKey);
    (httpService.get as jest.Mock).mockReturnValue(of(mockApiResponse));
    (mapToWeatherResponse as jest.Mock).mockReturnValue(mappedResponse);

    const result = await service.getWeather({ city });

    expect(configService.get).toHaveBeenCalledWith('WEATHER_API_KEY');
    expect(httpService.get).toHaveBeenCalledWith(url);
    expect(mapToWeatherResponse).toHaveBeenCalledWith(mockApiResponse.data);
    expect(result).toEqual(mappedResponse);
  });

  it('should throw NotFoundException if city not found', async () => {
    const apiKey = 'test-api-key';
    const city = 'UnknownCity';
    const url = `${process.env.WEATHER_BASE_API_URL}/current.json?key=${apiKey}&q=${encodeURIComponent(city)}`;
    const axiosError = {
      response: { status: 404 },
      isAxiosError: true,
    } as AxiosError;

    (configService.get as jest.Mock).mockReturnValue(apiKey);
    (httpService.get as jest.Mock).mockReturnValue(
      throwError(() => axiosError),
    );

    await expect(service.getWeather({ city })).rejects.toThrow(
      NotFoundException,
    );
    expect(configService.get).toHaveBeenCalledWith('WEATHER_API_KEY');
    expect(httpService.get).toHaveBeenCalledWith(url);
  });

  it('should throw InternalServerErrorException if API key is missing', async () => {
    (configService.get as jest.Mock).mockReturnValue(undefined);

    await expect(service.getWeather({ city: 'Kyiv' })).rejects.toThrow(
      InternalServerErrorException,
    );
    expect(configService.get).toHaveBeenCalledWith('WEATHER_API_KEY');
  });

  it('should throw InternalServerErrorException on unknown error', async () => {
    const apiKey = 'test-api-key';
    const city = 'Kyiv';
    const url = `${process.env.WEATHER_BASE_API_URL}/current.json?key=${apiKey}&q=${encodeURIComponent(city)}`;
    const axiosError = {
      response: { status: 500 },
      isAxiosError: true,
    } as AxiosError;

    (configService.get as jest.Mock).mockReturnValue(apiKey);
    (httpService.get as jest.Mock).mockReturnValue(
      throwError(() => axiosError),
    );

    await expect(service.getWeather({ city })).rejects.toThrow(
      InternalServerErrorException,
    );
    expect(configService.get).toHaveBeenCalledWith('WEATHER_API_KEY');
    expect(httpService.get).toHaveBeenCalledWith(url);
  });
});
