import { appConfigFactory, envSchema } from '@/infrastructure/configs';
import { GraphQLClientModule } from '@/infrastructure/graphql-client';
import { SwaggerAuthModule } from '@/infrastructure/swagger-auth/swagger-auth.module';
import { AuthModule } from '@/modules/auth/auth.module';
import { ExercisesModule } from '@/modules/exercises';
import { GoalServiceModule } from '@/modules/goal-service';
import { PlannerModule } from '@/modules/planner/planner.module';
import { TrainingTemplatesModule } from '@/modules/traning-templates';
import { TrainingsModule } from '@/modules/tranings';
import { UsersModule } from '@/modules/users/users.module';
import { HttpStatus, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BaseHttpException, ExceptionWrongRpcResponse } from '@shared/exceptions';
import { GatewayObservabilityModule } from '@shared/observability';
import { RpcResponseValidationModule } from '@shared/rpc-response-validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfigFactory],
      envFilePath: ['.env.production', '.env.development', '.env.test'],
      validate: (config) => envSchema.parse(config),
    }),
    SwaggerAuthModule,
    UsersModule,
    AuthModule,
    TrainingsModule,
    TrainingTemplatesModule,
    ExercisesModule,
    GoalServiceModule,
    PlannerModule,

    RpcResponseValidationModule.forFeature({
      useValue: ({ issues, message }) =>
        BaseHttpException.createFromBase(new ExceptionWrongRpcResponse({ issues, message }), HttpStatus.BAD_GATEWAY),
    }),

    GraphQLClientModule,
    GatewayObservabilityModule,
  ],
})
export class AppModule {}
