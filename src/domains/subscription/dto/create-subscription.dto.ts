import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { Frequency } from 'src/common/types/frequency';

export class CreateSubscriptionDto {
  @ApiProperty({
    description: 'Email address to subscribe',
    example: 'test@example.com',
  })
  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @ApiProperty({
    description: 'City for weather updates',
    example: 'Kyiv',
  })
  @IsString({ message: 'City must be a string' })
  @IsNotEmpty({ message: 'City is required' })
  city: string;

  @ApiProperty({
    description: 'Frequency of updates (hourly or daily)',
    enum: ['hourly', 'daily'],
  })
  @IsEnum(['hourly', 'daily'], {
    message: 'Frequency must be either hourly or daily',
  })
  frequency: Frequency;
}
