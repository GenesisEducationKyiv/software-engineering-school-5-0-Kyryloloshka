import { AxiosError } from 'axios';
import { IWeatherProvider } from '../interfaces/IWeatherProvider';
import { WeatherResponse } from 'src/common/types/weather';
import { mapToWeatherResponse } from 'src/common/mappers/weather.mapper';
import { GetWeatherDto } from '../dto/get-weather.dto';
import { catchError, firstValueFrom, throwError } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LogWeatherProvider } from '../decorator/log-weather-provider.decorator';

@Injectable()
export class OpenMeteoWeatherProvider implements IWeatherProvider {
  public readonly providerName = 'OpenMeteo';

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  @LogWeatherProvider()
  private async getCoordinates(
    city: string,
  ): Promise<{ latitude: number; longitude: number }> {
    const baseUrl = this.configService.get<string>('OPENMETEO_GEO_API_URL');
    const url = `${baseUrl}/search?name=${encodeURIComponent(city)}`;
    const geo = await firstValueFrom(
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
              new InternalServerErrorException('Failed to fetch coordinates'),
          );
        }),
      ),
    );
    if (!geo.data.results?.length)
      throw new NotFoundException('City not found');
    return {
      latitude: geo.data.results[0].latitude,
      longitude: geo.data.results[0].longitude,
    };
  }

  @LogWeatherProvider()
  async getWeather({ city }: GetWeatherDto): Promise<WeatherResponse> {
    const baseUrl = this.configService.get<string>('OPENMETEO_BASE_API_URL');

    const { latitude, longitude } = await this.getCoordinates(city);
    const getWeatherUrl = `${baseUrl}/forecast?latitude=${latitude}&longitude=${longitude}&current-weather=true&current=relative_humidity_2m,temperature_2m,weather_code,is_day`;
    const response = await firstValueFrom(
      this.httpService.get(getWeatherUrl).pipe(
        catchError((error: any) => {
          if (error.reason === 'Not Found') {
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
