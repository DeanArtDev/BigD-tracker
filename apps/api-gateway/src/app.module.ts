import { appConfigFactory } from '@/infrastructure/configs/app-config-factory';
import { RmqClientsModule } from '@/infrastructure/rmq-clients';
import { AuthModule } from '@/modules/auth/auth.module';
import { ExercisesModule } from '@/modules/exercises';
import { GoalServiceModule } from '@/modules/goal-service';
import { TrainingTemplatesModule } from '@/modules/traning-templates';
import { TrainingsModule } from '@/modules/tranings';
import { UsersModule } from '@/modules/users/users.module';
import { RpcResponseValidationInterceptor } from '@big-d/api-utils';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { DomainErrorFilter } from '@shared/filters/domain-error.filter';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfigFactory],
      envFilePath: ['.env.production', '.env.development'],
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
