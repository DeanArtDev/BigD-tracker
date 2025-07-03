import { APP_ENV } from '@/infrastructure/configs';
import { ACCESS_TOKEN_KEY } from '@/modules/auth';
import { INestApplication, Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { RpcToHttpExceptionInterceptor } from '@shared/interceptors';
import { LoggerMiddleware } from '@shared/middlewares/logger.middleware';
import { REFRESH_TOKEN_FIELD } from '@shared/services/cookies';
import * as cookieParser from 'cookie-parser';
import * as express from 'express';
import * as path from 'node:path';
import { AppModule } from './app.module';

const DOCUMENTATION_URL = 'documentation';
const SWAGGER_URL = 'swagger/json';

const connectSwagger = (app: INestApplication) => {
  const config = new DocumentBuilder()
    .setTitle('Big-D Tracker API')
    .setVersion('0.0.1')
    .addCookieAuth(REFRESH_TOKEN_FIELD)
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        in: 'header',
      },
      ACCESS_TOKEN_KEY,
    )
    .build();

  app.use('/swagger-custom', express.static(path.join(__dirname, '../../swagger')));
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(DOCUMENTATION_URL, app, documentFactory, {
    customJs: `/swagger-custom/swagger-init.js`,
    swaggerOptions: {
      persistAuthorization: true,
    },
    jsonDocumentUrl: SWAGGER_URL,
  });
};

async function bootstrap() {
  const logger = new Logger('Main module');
  const app = await NestFactory.create(AppModule);

  app.use(LoggerMiddleware);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // удаляет лишние поля
      forbidNonWhitelisted: false, // выбрасывает ошибку, если есть лишние поля
      transform: true, // включает class-transformer (plainToInstance)
    }),
  );

  app.useGlobalInterceptors(new RpcToHttpExceptionInterceptor());

  const configService = app.get<ConfigService<APP_ENV, true>>(ConfigService);
  const port = configService.get('API_PORT');

  const httpAdapter = app.getHttpAdapter();
  httpAdapter.getInstance().set('trust proxy', true);

  app.use(cookieParser());
  app.enableCors({
    origin: configService.get<string>('ORIGIN').split(',').filter(Boolean),
    credentials: true,
  });

  connectSwagger(app);

  app.connectMicroservice<MicroserviceOptions>(
    {
      transport: Transport.RMQ,
      options: {
        urls: ['amqp://devuser:devpassword@localhost:5672'],
        queue: 'web-gateway_queue',
        queueOptions: { durable: false, autoDelete: true },
        exchange: 'web-gateway_exchange',
        exchangeType: 'topic',
        wildcards: true,
      },
    },
    { inheritAppConfig: true },
  );

  await app.listen(port, '0.0.0.0', () => {
    logger.log(`
    🚀 Application is running at port http://localhost:${port}
    ----------------------------------------------------------------
    📄 Documentation is running at http://localhost:${port}/${DOCUMENTATION_URL}
    ----------------------------------------------------------------
    📜 To get open api string schema at http://localhost:${port}/${SWAGGER_URL}
    `);
  });
}
bootstrap();
