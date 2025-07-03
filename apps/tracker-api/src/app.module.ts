import { appConfigFactory } from '@/infrastructure/configs/app-config-factory';
import { DatabaseModule } from '@/infrastructure/db';
import { AuthModule } from '@/modules/auth/auth.module';
import { ExercisesModule } from '@/modules/exercises';
import { RepetitionsModule } from '@/modules/repetitions';
import { RmqClientsModule } from '@/modules/rmq-clients/rmq-clients.module';
import { TrainingTemplatesModule } from '@/modules/traning-templates';
import { TrainingsModule } from '@/modules/tranings';
import { UsersModule } from '@/modules/users/users.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { DomainErrorFilter } from '@shared/filters/domain-error.filter';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfigFactory],
      envFilePath: ['.env.production', '.env.development'],
    }),
    DatabaseModule,
    UsersModule,
    AuthModule,
    TrainingsModule,
    TrainingTemplatesModule,
    ExercisesModule,
    RepetitionsModule,
    RmqClientsModule,
  ],
  providers: [{ provide: APP_FILTER, useClass: DomainErrorFilter }],
})
export class AppModule {}
