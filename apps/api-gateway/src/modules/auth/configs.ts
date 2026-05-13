import { APP_ENV } from '@/infrastructure/configs';
import { ConfigService } from '@nestjs/config';
import { JwtModuleAsyncOptions } from '@nestjs/jwt';

const jwtConfigFabrica = (): JwtModuleAsyncOptions => ({
  inject: [ConfigService],
  useFactory: (configService: ConfigService<APP_ENV>) => {
    return {
      verifyOptions: {
        algorithms: ['RS256'],
        issuer: 'auth-service',
        audience: 'api-gateway',
      },
      publicKey: configService.get('PUBLIC_SECRET_KEY'),
    };
  },
});

export { jwtConfigFabrica };
