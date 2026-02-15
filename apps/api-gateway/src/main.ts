import {
  connectSwagger,
  DOCUMENTATION_URL,
  initApp,
  SWAGGER_URL,
} from '@/infrastructure/bootstrap';
import { APP_ENV } from '@/infrastructure/configs';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const logger = new Logger('API gateway main');

  const app = await initApp();

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

  const configService = app.get<ConfigService<APP_ENV, true>>(ConfigService);
  const port = configService.getOrThrow<number>('API_PORT');
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
bootstrap().catch(console.error);
