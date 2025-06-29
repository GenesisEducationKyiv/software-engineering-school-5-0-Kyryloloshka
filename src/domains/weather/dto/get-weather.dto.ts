import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GetWeatherDto {
  @ApiProperty({
    example: 'Kyiv',
    description: 'City name for weather forecast',
  })
  @IsString()
  @IsNotEmpty({ message: 'City is required' })
  city: string;
}
