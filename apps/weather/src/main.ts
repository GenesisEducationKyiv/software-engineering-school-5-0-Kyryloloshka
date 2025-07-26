import { NestFactory } from '@nestjs/core';
import { WeatherAppModule } from './modules/weather-app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { WEATHER_PACKAGE_NAME } from '@lib/common';

async function bootstrap() {
  const app = await NestFactory.create(WeatherAppModule);

  const grpcUrl = process.env.GRPC_URL || '0.0.0.0:5000';

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      package: WEATHER_PACKAGE_NAME,
      protoPath: join(process.cwd(), 'proto/weather.proto'),
      url: grpcUrl,
    },
  });

  await app.startAllMicroservices();
  await app.listen(3001);
}
bootstrap();
