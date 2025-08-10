import { Module } from '@nestjs/common';
import { WeatherService } from './weather.service';
import { WeatherController } from './weather.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { WEATHER_PACKAGE_NAME } from '@lib/common';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'WEATHER_CLIENT',
        transport: Transport.GRPC,
        options: {
          package: WEATHER_PACKAGE_NAME,
          protoPath: join(process.cwd(), 'proto/weather.proto'),
          url: process.env.WEATHER_SERVICE_URL || 'weather:5000',
        },
      },
    ]),
  ],
  providers: [WeatherService],
  controllers: [WeatherController],
})
export class WeatherModule {}
