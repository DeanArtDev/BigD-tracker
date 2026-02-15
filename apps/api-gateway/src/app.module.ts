import { appConfigFactory } from '@/infrastructure/configs';
import { SwaggerAuthModule } from '@/infrastructure/swagger-auth/swagger-auth.module';
import { AuthModule } from '@/modules/auth/auth.module';
import { ExercisesModule } from '@/modules/exercises';
import { GoalServiceModule } from '@/modules/goal-service';
import { TrainingTemplatesModule } from '@/modules/traning-templates';
import { TrainingsModule } from '@/modules/tranings';
import { UsersModule } from '@/modules/users/users.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from '@shared/observability';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfigFactory],
      envFilePath: ['.env.production', '.env.development'],
    }),
    SwaggerAuthModule,
    UsersModule,
    AuthModule,
    TrainingsModule,
    TrainingTemplatesModule,
    ExercisesModule,
    GoalServiceModule,

    LoggerModule,
  ],
})
export class AppModule {}
