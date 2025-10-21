import { ACCESS_TOKEN_KEY } from '@/modules/auth';
import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { REFRESH_TOKEN_FIELD } from '@shared/services/cookies';
import * as express from 'express';
import * as path from 'node:path';

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

  app.use('/swagger-custom', express.static(path.join(__dirname, '../../../', 'swagger')));
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(DOCUMENTATION_URL, app, documentFactory, {
    customJs: `/swagger-custom/swagger-init.js`,
    swaggerOptions: {
      persistAuthorization: true,
    },
    jsonDocumentUrl: SWAGGER_URL,
  });
};

export { connectSwagger, DOCUMENTATION_URL, SWAGGER_URL };
