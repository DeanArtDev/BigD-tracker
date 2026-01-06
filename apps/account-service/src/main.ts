import { appConfigFactory } from '@/infrastructure/configs';
import { ApplicationExceptionsInterceptor } from '@/modules/auth/application/interceptors';
import { accountServiceRmqConfig } from '@big-d/api-contracts';
import {
  ErrorsToRpcExceptionInterceptor,
  RmqLoggerDeserializer,
  RmqLoggerSerializer,
} from '@big-d/api-utils';
import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Account Main');
  const config = await appConfigFactory();

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    accountServiceRmqConfig({
      host: config.RMQ_HOST,
      port: config.RMQ_PORT,
      user: config.RMQ_USER,
      password: config.RMQ_PASSWORD,
      isProd: config.IS_PROD,
      deserializer: new RmqLoggerDeserializer(),
      serializer: new RmqLoggerSerializer(),
    }),
  );

  app.useLogger(logger);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // удаляет лишние поля
      forbidNonWhitelisted: false, // выбрасывает ошибку, если есть лишние поля
      transform: true, // включает class-transformer (plainToInstance)
    }),
  );

  app.useGlobalInterceptors(new ApplicationExceptionsInterceptor());
  app.useGlobalInterceptors(new ErrorsToRpcExceptionInterceptor());

  await app.listen();
  logger.log(`🚀 Account service is running, port: ${config.API_PORT}`);
}

bootstrap();
