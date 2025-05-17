// create-subscription.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsString } from 'class-validator';

export class CreateSubscriptionDto {
  @ApiProperty({
    description: 'Email address to subscribe',
    example: 'test@example.com',
  })
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @ApiProperty({
    description: 'City for weather updates',
    example: 'Kyiv',
  })
  @IsString()
  city: string;

  @ApiProperty({
    description: 'Frequency of updates (hourly or daily)',
    enum: ['hourly', 'daily'],
  })
  @IsEnum(['hourly', 'daily'], {
    message: 'Frequency must be either hourly or daily',
  })
  frequency: 'hourly' | 'daily';
}
