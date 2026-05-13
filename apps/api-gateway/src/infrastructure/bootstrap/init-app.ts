import { AppModule } from '@/app.module';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ExceptionRequestDataValidation, HttpExceptionFactory } from '@shared/exceptions';
import { GateWayExceptionFilter } from '@shared/filters';
import { DomainErrorFilter } from '@shared/filters/domain-error.filter';
import { RequestContextMiddleware } from '@shared/request-context';
import * as cookieParser from 'cookie-parser';
import { json, urlencoded } from 'express';

const initApp = async (): Promise<INestApplication> => {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.setGlobalPrefix('api');

  app.set('query parser', 'extended');
  app.use(json({ limit: '10mb' }));
  app.use(urlencoded({ extended: true, limit: '10mb' }));

  app.use(RequestContextMiddleware);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // удаляет лишние поля
      forbidNonWhitelisted: false, // выбрасывает ошибку, если есть лишние поля
      transform: true, // включает class-transformer (plainToInstance)
      exceptionFactory: (errors) =>
        HttpExceptionFactory.createBadRequestException(
          new ExceptionRequestDataValidation({ issues: errors, message: 'Invalid request data' }),
        ),
    }),
  );

  const configService = app.get<ConfigService>(ConfigService);
  app.useGlobalFilters(new DomainErrorFilter());
  app.useGlobalFilters(new GateWayExceptionFilter(configService));

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
