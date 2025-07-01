import { appConfigFactory } from '@/infrastructure/configs';
import { ErrorsToRpcExceptionInterceptor, LoggingInterceptor } from '@big-d/api-utils';
import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('AccountService');
  const config = await appConfigFactory();
  const rmqUrl = `amqp://${config.RMQ_USER}:${config.RMQ_PASSWORD}@${config.RMQ_HOST}:${config.RMQ_PORT}`;

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.RMQ,
    options: {
      urls: [rmqUrl],
      queue: 'account_service_queue',
      queueOptions: { durable: config.IS_PROD, autoDelete: true },
      exchange: 'account_service_exchange',
      exchangeType: 'topic',
      wildcards: true,
    },
  });

  app.useLogger(logger);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // удаляет лишние поля
      forbidNonWhitelisted: false, // выбрасывает ошибку, если есть лишние поля
      transform: true, // включает class-transformer (plainToInstance)
    }),
  );

  app.useGlobalInterceptors(new ErrorsToRpcExceptionInterceptor());
  app.useGlobalInterceptors(new LoggingInterceptor({ name: 'RMQ' }));

  await app.listen();
  logger.log(`🚀 Account service is running`);
}

bootstrap();
