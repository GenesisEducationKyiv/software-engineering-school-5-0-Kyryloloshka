import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { WeatherService } from './weather.service';
import { GetWeatherDto } from 'apps/weather/src/modules/weather/dto/get-weather.dto';

@ApiTags('weather')
@Controller('weather')
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

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
    return await this.weatherService.getWeather(query);
  }
}
