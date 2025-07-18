import { APP_ENV } from '@/infrastructure/configs';
import { ConfigService } from '@nestjs/config';
import { JwtModuleAsyncOptions } from '@nestjs/jwt';

const jwtConfigFabrica = (): JwtModuleAsyncOptions => ({
  inject: [ConfigService],
  useFactory: (configService: ConfigService<APP_ENV>) => {
    return {
      global: true,
      secret: configService.get('AUTH_SECRET_KEY'),
    };
  },
});

export { jwtConfigFabrica };
