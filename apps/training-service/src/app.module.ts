import { appConfigFactory } from '@/infrastructure/configs';
import { RmqClientsModule } from '@/infrastructure/rmq-clients';
import { ExercisesModule } from '@/modules/exercises';
import { RepetitionsModule } from '@/modules/repetitions';
import { LoggerModuleOptions, ObservabilityModule } from '@big-d/api-utils';
import { DatabaseModule } from '@big-d/database';
import { dbConfigFactory } from '@infrastructure/configs';
import { TrainingTemplatesModule } from '@modules/traning-templates';
import { TrainingsModule } from '@modules/tranings';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    RmqClientsModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfigFactory],
      envFilePath: ['.env.production', '.env.development'],
    }),
    DatabaseModule.forRootAsync(dbConfigFactory()),
    ObservabilityModule.forRootAsync({
      global: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService): LoggerModuleOptions => {
        return {
          env: configService.get('NODE_ENV', 'development'),
          level: configService.get('LOG_LEVEL'),
        };
      },
    }),

    RepetitionsModule,
    ExercisesModule,
    TrainingsModule,
    TrainingTemplatesModule,
  ],
})
export class AppModule {}
