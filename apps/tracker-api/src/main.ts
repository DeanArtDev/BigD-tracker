import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { APP_ENV } from '@shared/configs';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

const DOCUMENTATION_URL = 'documentation';
const SWAGGER_URL = 'swagger/json';

const connectSwagger = (app: INestApplication) => {
  const config = new DocumentBuilder()
    .setTitle('Solvery example')
    .setDescription('The best API ever!')
    .setVersion('0.0.1')
    .addTag('some tag')
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(DOCUMENTATION_URL, app, documentFactory, {
    jsonDocumentUrl: SWAGGER_URL,
  });
};

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // удаляет лишние поля
      forbidNonWhitelisted: true, // выбрасывает ошибку, если есть лишние поля
      transform: true, // включает class-transformer (plainToInstance)
    }),
  );

  const configService = app.get<ConfigService<APP_ENV, true>>(ConfigService);
  const port = configService.get('API_PORT');

  app.setGlobalPrefix(`api`);
  connectSwagger(app);

  await app.listen(port, '0.0.0.0', () => {
    console.log(`
    🚀 Application is running at port http://localhost:${port};
       Documentation is running at http://localhost:${port}/${DOCUMENTATION_URL};
       To get open api string schema at http://localhost:${port}/${SWAGGER_URL};
    `);
  });
}
bootstrap();
