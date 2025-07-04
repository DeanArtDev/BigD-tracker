import { appConfigFactory } from '@/infrastructure/configs';
import { RmqClientsModule } from '@/infrastructure/rmq-clients';
import { ExercisesModule } from '@/modules/exercises';
import { RepetitionsModule } from '@/modules/repetitions';
import { DatabaseModule } from '@big-d/database';
import { dbConfigFactory } from '@infrastructure/configs';
import { TrainingTemplatesModule } from '@modules/traning-templates';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    RmqClientsModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfigFactory],
      envFilePath: ['.env.production', '.env.development'],
    }),
    DatabaseModule.forRootAsync(dbConfigFactory()),

    RepetitionsModule,
    ExercisesModule,
    TrainingTemplatesModule,
  ],
})
export class AppModule {}
