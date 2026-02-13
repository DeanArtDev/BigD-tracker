import { APP_ENV } from '@/infrastructure/configs';
import { ACCESS_TOKEN_KEY } from '@/modules/auth';
import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { REFRESH_TOKEN_FIELD } from '@shared/services/cookies';
import * as express from 'express';
import * as path from 'node:path';
import * as passport from 'passport';

const DOCUMENTATION_URL = 'documentation';
const SWAGGER_URL = 'swagger/json';

const connectSwagger = (app: INestApplication) => {
  const configService = app.get<ConfigService<APP_ENV, true>>(ConfigService);
  const isProd = configService.getOrThrow<number>('IS_PROD');

  if (isProd) {
    app.use(passport.initialize());
    app.use(
      [`/${DOCUMENTATION_URL}`, `/${SWAGGER_URL}`],
      passport.authenticate('swagger', { session: false }),
    );
  }

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

  app.use('/swagger-custom', express.static(path.join(__dirname, '../../../', 'swagger')));
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(DOCUMENTATION_URL, app, documentFactory, {
    swaggerOptions: {
      persistAuthorization: true,
    },
    jsonDocumentUrl: SWAGGER_URL,
  });
};

export { connectSwagger, DOCUMENTATION_URL, SWAGGER_URL };
