import { addApplicationUses } from '@/infrastructure/bootstrap';
import { appConfigFactory } from '@/infrastructure/configs';
import { goalServiceRmqConfig } from '@big-d/api-contracts';
import { RmqLoggerDeserializer, RmqLoggerSerializer } from '@big-d/api-utils';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Goal Main');
  const config = appConfigFactory();

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    goalServiceRmqConfig({
      host: config.RMQ_HOST,
      port: config.RMQ_PORT,
      user: config.RMQ_USER,
      password: config.RMQ_PASSWORD,
      isProd: config.IS_PROD,
      deserializer: new RmqLoggerDeserializer({ fullLog: true }),
      serializer: new RmqLoggerSerializer({ fullLog: true }),
    }),
  );

  app.useLogger(logger);
  addApplicationUses(app);

  await app.listen();
  app.enableShutdownHooks();
  logger.log(`🚀 Goal service is running, port: ${config.API_PORT}`);
}

bootstrap();
