import { Controller, Get, Inject, Query } from '@nestjs/common';
import { GetWeatherDto } from './dto/get-weather.dto';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { IWeatherService } from './interfaces/weather-service.interface';

@ApiTags('weather')
@Controller('weather')
export class WeatherController {
  constructor(
    @Inject('IWeatherService')
    private readonly weatherService: IWeatherService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get current weather for a city' })
  @ApiQuery({ name: 'city', required: true, type: String })
  @ApiOkResponse({
    description: 'Successful operation - current weather forecast returned',
    schema: {
      example: {
        temperature: 17.2,
        humidity: 65,
        description: 'Partly cloudy',
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Invalid request' })
  @ApiNotFoundResponse({ description: 'City not found' })
  async getWeather(@Query() query: GetWeatherDto) {
    return this.weatherService.getWeather(query);
  }
}
