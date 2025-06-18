import { Test, TestingModule } from '@nestjs/testing';
import { WeatherService } from './weather.service';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { of, throwError } from 'rxjs';
import { AxiosResponse } from 'axios';
import { WeatherApiResponse } from 'src/common/types/weatherApiProvider';

const httpMock = () => ({
  get: jest.fn((url) => url),
});

const mockWeatherApiDataResponse = {
  current: {
    temp_c: 23.3,
    condition: {
      text: 'Sunny',
    },
    humidity: 46,
  },
} as WeatherApiResponse;

const configMock = () => ({
  get: jest.fn().mockReturnValue('dummy-key'),
});

describe('WeatherService', () => {
  let service: WeatherService;
  let httpService: ReturnType<typeof httpMock>;
  let configService: ReturnType<typeof configMock>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WeatherService,
        { provide: HttpService, useFactory: httpMock },
        { provide: ConfigService, useFactory: configMock },
      ],
    }).compile();

    service = module.get<WeatherService>(WeatherService);
    httpService = module.get(HttpService);
    configService = module.get(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should throw InternalServerErrorException if API key is missing', async () => {
    jest.spyOn(configService, 'get').mockReturnValueOnce(undefined);
    await expect(service.getWeather({ city: 'Kyiv' })).rejects.toThrow(
      InternalServerErrorException,
    );
  });

  it('should return mapped weather data on success', async () => {
    const axiosResponse = {
      data: mockWeatherApiDataResponse,
    } as AxiosResponse;
    httpService.get.mockReturnValueOnce(of(axiosResponse));

    const result = await service.getWeather({ city: 'Kyiv' });

    expect(result).toHaveProperty('temperature');
    expect(result).toHaveProperty('humidity');
    expect(result).toHaveProperty('description');
  });

  it('should throw NotFoundException for 404/400 errors', async () => {
    const error = {
      response: { status: 404 },
    };
    httpService.get.mockReturnValueOnce(throwError(() => error));

    await expect(service.getWeather({ city: 'UnknownCity' })).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should throw InternalServerErrorException for other errors', async () => {
    const error = {
      response: { status: 500 },
    };
    httpService.get.mockReturnValueOnce(throwError(() => error));

    await expect(service.getWeather({ city: 'Kyiv' })).rejects.toThrow(
      InternalServerErrorException,
    );
  });
});
