import { appConfigFactory } from '@/infrastructure/configs';
import { RmqClientsModule } from '@/infrastructure/rmq-clients';
import { ExercisesModule } from '@/modules/exercises';
import { RepetitionsModule } from '@/modules/repetitions';
import { DatabaseModule } from '@big-d/database';
import { dbConfigFactory } from '@infrastructure/configs';
import { TrainingTemplatesModule } from '@modules/traning-templates';
import { TrainingsModule } from '@modules/tranings';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TrainingObservabilityModule } from '@shared/observability';
import { RequestContextInterceptor } from '@shared/request-context';

@Module({
  providers: [RequestContextInterceptor],
  imports: [
    RmqClientsModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfigFactory],
      envFilePath: ['.env.production', '.env.development', '.env.test'],
    }),
    DatabaseModule.forRootAsync(dbConfigFactory()),
    TrainingObservabilityModule,

    RepetitionsModule,
    ExercisesModule,
    TrainingsModule,
    TrainingTemplatesModule,
  ],
})
export class AppModule {}
