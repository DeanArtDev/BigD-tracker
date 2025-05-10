import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ConfigService } from "@nestjs/config";
import { APP_ENV } from "@shared/configs";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get<ConfigService<APP_ENV, true>>(ConfigService);
  const port = configService.get("API_PORT");

  app.setGlobalPrefix(`api`);

  await app.listen(port, "0.0.0.0", () => {
    console.log(`
    🚀 Application is running at port http://localhost:${port}/api;
    `);
  });
}
bootstrap();
