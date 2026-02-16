import { addApplicationUses } from '@/infrastructure/bootstrap';
import { appConfigFactory } from '@/infrastructure/configs';
import { goalServiceRmqConfig } from '@big-d/api-contracts';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  const config = appConfigFactory();

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    goalServiceRmqConfig({
      host: config.RMQ_HOST,
      port: config.RMQ_PORT,
      user: config.RMQ_USER,
      password: config.RMQ_PASSWORD,
      isProd: config.IS_PROD,
    }),
  );

  addApplicationUses(app);

  await app.listen();
  app.enableShutdownHooks();

  console.log(`🚀 Goal service is running, port: ${config.API_PORT}`);
}

bootstrap().catch(console.error);
