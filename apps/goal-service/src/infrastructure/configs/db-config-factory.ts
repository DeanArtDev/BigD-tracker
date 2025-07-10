import { DatabaseModule, DB_ENV } from '@big-d/database';
import { ConfigModule, ConfigService } from '@nestjs/config';

export function dbConfigFactory(): Parameters<typeof DatabaseModule.forRootAsync>[0] {
  return {
    imports: [ConfigModule],
    inject: [ConfigService],
    useFactory: (configService: ConfigService<DB_ENV>) => {
      return {
        host: configService.get('DB_HOST'),
        port: +configService.get('DB_PORT'),
        user: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_DATABASE'),
        schema: 'goal',
      };
    },
  };
}
