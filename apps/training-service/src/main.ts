import { appConfigFactory } from '@/infrastructure/configs';
import { trainingServiceRmqConfig } from '@big-d/api-contracts';
import { ErrorsToRpcExceptionInterceptor, RmqInboundLoggingInterceptor } from '@big-d/api-utils';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  const config = await appConfigFactory();

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    trainingServiceRmqConfig({
      host: config.RMQ_HOST,
      port: config.RMQ_PORT,
      user: config.RMQ_USER,
      password: config.RMQ_PASSWORD,
      isProd: config.IS_PROD,
    }),
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // удаляет лишние поля
      forbidNonWhitelisted: false, // выбрасывает ошибку, если есть лишние поля
      transform: true, // включает class-transformer (plainToInstance)
    }),
  );

  app.useGlobalInterceptors(new ErrorsToRpcExceptionInterceptor());
  app.useGlobalInterceptors(app.get(RmqInboundLoggingInterceptor));

  await app.listen();
  console.log(`🚀 Training service is running, port: ${config.API_PORT}`);
}

bootstrap().catch(console.error);
