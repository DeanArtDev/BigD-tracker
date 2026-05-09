import { connectSwagger, DOCUMENTATION_URL, initApp, SWAGGER_URL } from '@/infrastructure/bootstrap';
import { APP_ENV } from '@/infrastructure/configs';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await initApp();

  connectSwagger(app);

  const configService = app.get<ConfigService<APP_ENV, true>>(ConfigService);
  const port = configService.getOrThrow<number>('API_PORT');
  const isDev = configService.getOrThrow<boolean>('IS_DEV');

  await app.listen(port, '0.0.0.0', () => {
    if (isDev) {
      console.log(`
    🚀 Application is running at port http://localhost:${port}
    ----------------------------------------------------------------
    📄 Documentation is running at http://localhost:${port}/${DOCUMENTATION_URL}
    ----------------------------------------------------------------
    📜 To get open api string schema at http://localhost:${port}/${SWAGGER_URL}
    
    📜 To get open graphql playground at http://localhost:${port}/graphql
    `);
    }
  });
}
bootstrap().catch(console.error);
