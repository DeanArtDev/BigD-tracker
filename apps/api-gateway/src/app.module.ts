import { APP_ENV, appConfigFactory, envSchema } from '@/infrastructure/configs';
import { GraphQLClientModule } from '@/infrastructure/graphql-client';
import { SwaggerAuthModule } from '@/infrastructure/swagger-auth/swagger-auth.module';
import { AuthModule } from '@/modules/auth/auth.module';
import { ExercisesModule } from '@/modules/exercises';
import { GoalServiceModule } from '@/modules/goal-service';
import { PlannerModule } from '@/modules/planner/planner.module';
import { TrainingTemplatesModule } from '@/modules/traning-templates';
import { TrainingsModule } from '@/modules/tranings';
import { UsersModule } from '@/modules/users/users.module';
import { LoggerModuleOptions, ObservabilityModule } from '@big-d/api-utils';
import { HttpStatus, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BaseHttpException, ExceptionWrongRpcResponse } from '@shared/exceptions';
import { ApiGatewayRequestContext } from '@shared/request-context';
import { RpcResponseValidationModule } from '@shared/rpc-response-validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfigFactory],
      envFilePath: ['.env.production', '.env.development'],
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

    ObservabilityModule.forRootAsync({
      global: true,
      requestContext: ApiGatewayRequestContext,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService<APP_ENV>): LoggerModuleOptions => {
        return {
          env: configService.get('NODE_ENV', 'production'),
          level: configService.get('LOG_PRETTY'),
        };
      },
    }),
  ],
})
export class AppModule {}
