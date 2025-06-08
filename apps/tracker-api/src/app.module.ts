import { ExerciseTemplatesModule } from '@/exercises-templates/exercise-templates.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { appConfigFactory } from '@shared/configs/app-config-factory';
import { DomainErrorFilter } from '@shared/filters/domain-error.filter';
import { DatabaseModule } from '@shared/modules/db';
import { UsersModule } from '@/users/users.module';
import { AuthModule } from '@/auth/auth.module';
import { TrainingsModule } from '@/tranings/trainings.module';
import { TrainingAggregationModule } from '@/training-aggregation/training-aggregation.module';
import { TrainingTemplateAggregationModule } from '@/training-template-aggregation/training-template-aggregation.module';
import { RepetitionsModule } from '@/repetitions/repetitions.module';

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
    TrainingTemplateAggregationModule,
    TrainingsModule,
    ExerciseTemplatesModule,
    TrainingAggregationModule,
    RepetitionsModule,
  ],
  providers: [{ provide: APP_FILTER, useClass: DomainErrorFilter }],
})
export class AppModule {}
