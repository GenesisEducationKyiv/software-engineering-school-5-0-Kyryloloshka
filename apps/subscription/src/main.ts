import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { SUBSCRIPTION_PACKAGE_NAME } from '@lib/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const grpcUrl = process.env.GRPC_URL || '0.0.0.0:5001';

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      package: SUBSCRIPTION_PACKAGE_NAME,
      protoPath: join(process.cwd(), 'proto/subscription.proto'),
      url: grpcUrl,
    },
  });

  await app.startAllMicroservices();
  await app.listen(3002);
}
bootstrap();
