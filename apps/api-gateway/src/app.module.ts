import { appConfigFactory } from '@/infrastructure/configs/app-config-factory';
import { AuthModule } from '@/modules/auth/auth.module';
import { ExercisesModule } from '@/modules/exercises';
import { RmqClientsModule } from '@/infrastructure/rmq-clients';
import { GoalServiceModule } from '@/modules/goal-service';
import { TrainingTemplatesModule } from '@/modules/traning-templates';
import { TrainingsModule } from '@/modules/tranings';
import { UsersModule } from '@/modules/users/users.module';
import { RpcResponseValidationInterceptor } from '@big-d/api-utils';
import { DatabaseModule, DB_ENV, dbConfigFactory } from '@big-d/database';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { DomainErrorFilter } from '@shared/filters/domain-error.filter';

@Module({
  imports: [
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
    TrainingsModule,
    TrainingTemplatesModule,
    ExercisesModule,
    RmqClientsModule,
    GoalServiceModule,
  ],
  providers: [
    { provide: APP_FILTER, useClass: DomainErrorFilter },
    {
      provide: APP_INTERCEPTOR,
      useClass: RpcResponseValidationInterceptor,
    },
  ],
})
export class AppModule {}
