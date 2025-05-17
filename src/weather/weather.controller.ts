// src/weather/weather.controller.ts
import { Controller, Get, Query, BadRequestException } from '@nestjs/common';
import { WeatherService } from './weather.service';
import { GetWeatherDto } from './dto/get-weather.dto';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('weather')
@Controller('weather')
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  @Get()
  @ApiOperation({ summary: 'Get current weather for a city' })
  @ApiQuery({ name: 'city', required: true, type: String })
  @ApiResponse({
    status: 200,
    description: 'Successful operation - current weather forecast returned',
    schema: {
      example: {
        temperature: 17.2,
        humidity: 65,
        description: 'Partly cloudy',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid request' })
  @ApiResponse({ status: 404, description: 'City not found' })
  async getWeather(@Query() query: GetWeatherDto) {
    if (!query.city) {
      throw new BadRequestException('City is required');
    }

    return this.weatherService.getWeather(query);
  }
}
