import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { WeatherAppModule } from './modules/weather-app.module';
import { join } from 'path';
import { WEATHER_PACKAGE_NAME } from '@lib/common';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    WeatherAppModule,
    {
      transport: Transport.GRPC,
      options: {
        package: WEATHER_PACKAGE_NAME,
        protoPath: join(process.cwd(), 'proto/weather.proto'),
        url: `0.0.0.0:5000`,
      },
    },
  );

  await app.listen();
}
bootstrap();
