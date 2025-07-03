import { appConfigFactory } from '@/infrastructure/configs/app-config-factory';
import { AuthModule } from '@/modules/auth/auth.module';
import { RmqClientsModule } from '@/modules/rmq-clients';
import { UsersModule } from '@/modules/users';
import { DatabaseModule, DB_ENV, dbConfigFactory } from '@big-d/database';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    CqrsModule.forRoot(),
    RmqClientsModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfigFactory],
      envFilePath: ['.env.production', '.env.development'],
    }),
    DatabaseModule.forRootAsync({
      imports: [
        ConfigModule.forRoot({
          load: [dbConfigFactory],
          envFilePath: ['.env.production', '.env.development'],
        }),
      ],
      inject: [ConfigService],
      useFactory: (configService: ConfigService<DB_ENV>) => {
        return {
          host: configService.get('DB_HOST'),
          port: +configService.get('DB_PORT'),
          user: configService.get('DB_USERNAME'),
          password: configService.get('DB_PASSWORD'),
          database: configService.get('DB_DATABASE'),
          schema: 'account',
          logging: ['query', 'error'],
        };
      },
    }),

    UsersModule,
    AuthModule,
  ],
})
export class AppModule {}
