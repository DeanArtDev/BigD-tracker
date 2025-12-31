import { AppModule } from '@/app.module';
import { APP_ENV } from '@/infrastructure/configs';
import { LoggerMiddleware } from '@big-d/api-utils';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { RpcToHttpExceptionFilter } from '@shared/filters';
import { DomainErrorFilter } from '@shared/filters/domain-error.filter';
import * as cookieParser from 'cookie-parser';

const initApp = async (): Promise<INestApplication> => {
  const app = await NestFactory.create(AppModule);

  app.use(LoggerMiddleware);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // удаляет лишние поля
      forbidNonWhitelisted: false, // выбрасывает ошибку, если есть лишние поля
      transform: true, // включает class-transformer (plainToInstance)
    }),
  );

  app.useGlobalFilters(new DomainErrorFilter());
  app.useGlobalFilters(new RpcToHttpExceptionFilter());

  const configService = app.get<ConfigService<APP_ENV, true>>(ConfigService);

  const httpAdapter = app.getHttpAdapter();
  httpAdapter.getInstance().set('trust proxy', true);
  app.use(cookieParser());

  const origin = configService
    .get<string>('ORIGIN', '')
    .split(',')
    .map((i) => i.trim())
    .filter(Boolean);

  app.enableCors({
    origin: configService.get('IS_DEV') ? true : origin,
    credentials: true,
  });

  return app;
};

export { initApp };
