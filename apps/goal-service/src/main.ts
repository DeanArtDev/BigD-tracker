import { addApplicationUses } from '@/infrastructure/bootstrap';
import { appConfigFactory } from '@/infrastructure/configs';
import { goalServiceRmqConfig } from '@big-d/api-contracts';
import { ServiceLifecycleLogger } from '@big-d/observability/nest';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions } from '@nestjs/microservices';
import { performance } from 'node:perf_hooks';
import { AppModule } from './app.module';

async function bootstrap() {
  const startedAt = performance.now();
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

  app.enableShutdownHooks();
  await app.listen();
  app.get(ServiceLifecycleLogger).started(performance.now() - startedAt);

  console.log(`🚀 Goal service is running, port: ${config.API_PORT}`);
}

bootstrap().catch(console.error);
