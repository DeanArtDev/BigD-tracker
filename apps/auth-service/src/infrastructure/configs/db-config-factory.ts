import { dbConfig } from './app-config-factory';
import { PostgresDbModule } from '@big-d/database';
import { ConfigModule, ConfigService } from '@nestjs/config';

export function dbConfigFactory(): Parameters<typeof PostgresDbModule.forRootAsync>[0] {
  return {
    imports: [ConfigModule.forFeature(dbConfig)],
    inject: [ConfigService],
    useFactory: (configService: ConfigService) => {
      return {
        host: configService.get('db.HOST'),
        port: configService.get<number>('db.PORT'),
        user: configService.get('db.USERNAME'),
        password: configService.get('db.PASSWORD'),
        database: configService.get('db.DATABASE'),
      };
    },
  };
}
