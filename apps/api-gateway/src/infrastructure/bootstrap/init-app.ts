import { AppModule } from '@/app.module';
import { GraphQLExceptionFilter } from '@/infrastructure/graphql-client/graphql.exception-filter';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ExceptionRequestDataValidation, HttpExceptionFactory } from '@shared/exceptions';
import { GateWayExceptionFilter } from '@shared/filters';
import { DomainErrorFilter } from '@shared/filters/domain-error.filter';
import { RequestContextMiddleware } from '@shared/request-context';
import * as cookieParser from 'cookie-parser';
import { json, urlencoded, type RequestHandler } from 'express';
import { parse as parseQueryString, type ParsedQs } from 'qs';

const QUERY_PARSER_OPTIONS = {
  allowPrototypes: false,
  arrayLimit: 100,
  depth: 10,
  parameterLimit: 1_000,
} as const;

const parseRequestQuery = (value: string): ParsedQs => parseQueryString(value, QUERY_PARSER_OPTIONS);
const createRequestUrlencodedParser = (): RequestHandler =>
  urlencoded({
    extended: true,
    limit: '10mb',
    parameterLimit: QUERY_PARSER_OPTIONS.parameterLimit,
  });

const initApp = async (): Promise<INestApplication> => {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.setGlobalPrefix('api');

  app.set('query parser', parseRequestQuery);
  app.use(json({ limit: '10mb' }));
  app.use(createRequestUrlencodedParser());

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
  app.useGlobalFilters(new GraphQLExceptionFilter());

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

export { createRequestUrlencodedParser, initApp, parseRequestQuery, QUERY_PARSER_OPTIONS };
