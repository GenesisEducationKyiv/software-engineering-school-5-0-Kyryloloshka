import { IWeatherProvider } from '../interfaces/weather-provider.interface';
import { WeatherResponse } from '@lib/common/types/weather/weather';
import { mapToWeatherResponse } from '@lib/common/mappers/weather.mapper';
import { GetWeatherDto } from '../../../../../../libs/common/src/types/weather/dto/get-weather.dto';
import { catchError, firstValueFrom, throwError } from 'rxjs';
import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { AxiosError } from 'axios';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { LogWeatherProvider } from '../decorator/log-weather-provider.decorator';

@Injectable()
export class WeatherApiProvider implements IWeatherProvider {
  public readonly providerName = 'WeatherAPI';

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  @LogWeatherProvider()
  async getWeather({ city }: GetWeatherDto): Promise<WeatherResponse> {
    const apiKey = this.configService.get<string>('WEATHER_API_KEY');
    if (!apiKey) {
      throw new InternalServerErrorException('Weather API key not configured');
    }

    const url = `${process.env.WEATHER_BASE_API_URL}/current.json?key=${apiKey}&q=${encodeURIComponent(city)}`;

    const response = await firstValueFrom(
      this.httpService.get(url).pipe(
        catchError((error: AxiosError) => {
          if (
            error.response?.status === 400 ||
            error.response?.status === 404
          ) {
            return throwError(() => new NotFoundException('City not found'));
          }

          return throwError(
            () =>
              new InternalServerErrorException('Failed to fetch weather data'),
          );
        }),
      ),
    );

    return mapToWeatherResponse(response.data);
  }
}
