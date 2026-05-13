import { authConfig } from '@/infrastructure/configs';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModuleAsyncOptions } from '@nestjs/jwt';

const jwtConfigFabrica = (): JwtModuleAsyncOptions => ({
  inject: [ConfigService],
  imports: [ConfigModule.forFeature(authConfig)],
  useFactory: (configService: ConfigService) => {
    return {
      verifyOptions: {
        algorithms: ['RS256'],
        issuer: 'auth-service',
        audience: 'api-gateway',
      },
      publicKey: configService.get('auth.AUTH_PUBLIC_KEY'),
    };
  },
});

export { jwtConfigFabrica };
