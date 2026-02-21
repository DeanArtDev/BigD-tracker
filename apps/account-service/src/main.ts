import { appConfigFactory } from '@/infrastructure/configs';
import { ApplicationExceptionsInterceptor } from '@/modules/auth/application/interceptors';
import { accountServiceRmqConfig } from '@big-d/api-contracts';
import { ErrorsToRpcExceptionInterceptor, RmqInboundLoggingInterceptor } from '@big-d/api-utils';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions } from '@nestjs/microservices';
import { AccountExceptionToRpc } from '@shared/exception-filters';
import { AppModule } from './app.module';

async function bootstrap() {
  const config = await appConfigFactory();

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    accountServiceRmqConfig({
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

  app.useGlobalInterceptors(new ApplicationExceptionsInterceptor());
  app.useGlobalInterceptors(new ErrorsToRpcExceptionInterceptor());
  app.useGlobalInterceptors(app.get(RmqInboundLoggingInterceptor));
  app.useGlobalFilters(new AccountExceptionToRpc());

  await app.listen();
  console.log(`🚀 Account service is running, port: ${config.API_PORT}`);
}

bootstrap().catch(console.error);
