import * as cookieParser from 'cookie-parser';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { APP_ENV } from '@shared/configs';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { REFRESH_TOKEN_FIELD } from '@shared/services/cookies.service';
import { AuthService } from '@/auth/auth.service';
import { UsersService } from '@/users/users.service';
import * as path from 'node:path';
import * as express from 'express';
import { ACCESS_TOKEN_KEY } from '@/auth/lib';
import { testUserConfig } from '@db/seeds/test-user';

const DOCUMENTATION_URL = 'documentation';
const SWAGGER_URL = 'swagger/json';

const getTestUserToken = async (app: INestApplication, login: string) => {
  const authService = app.get<AuthService>(AuthService);
  const userService = app.get<UsersService>(UsersService);
  const testUser = await userService.findUser({ email: login });
  try {
    const { accessToken = 'there is no any test users' } =
      await authService.createTestUserSession({
        userId: testUser.id,
      });
    return accessToken;
  } catch (err) {
    console.log(`При создании токена для тестового пользователя что то отъебнуло`, err);
  }
};

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
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // удаляет лишние поля
      forbidNonWhitelisted: false, // выбрасывает ошибку, если есть лишние поля
      transform: true, // включает class-transformer (plainToInstance)
    }),
  );

  const configService = app.get<ConfigService<APP_ENV, true>>(ConfigService);
  const port = configService.get('API_PORT');

  const httpAdapter = app.getHttpAdapter();
  httpAdapter.getInstance().set('trust proxy', true);

  app.use(cookieParser());
  app.enableCors({
    origin: ['http://localhost:3033', 'http://localhost:4173'],
    credentials: true,
  });

  const testUserToken = await getTestUserToken(app, testUserConfig.TEST_USER_LOGIN);
  connectSwagger(app);

  await app.listen(port, '0.0.0.0', () => {
    console.log(`
    🚀 Application is running at port http://localhost:${port};
    ----------------------------------------------------------------
    📄 Documentation is running at http://localhost:${port}/${DOCUMENTATION_URL}?token=${testUserToken};
    ----------------------------------------------------------------
    📜 To get open api string schema at http://localhost:${port}/${SWAGGER_URL};
    `);
  });
}
bootstrap();
