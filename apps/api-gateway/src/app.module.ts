import { APP_ENV, appConfigFactory, envSchema } from '@/infrastructure/configs';
import { PubSubModule } from '@/infrastructure/pubsub';
import { SwaggerAuthModule } from '@/infrastructure/swagger-auth/swagger-auth.module';
import { AuthModule } from '@/modules/auth/auth.module';
import { ExercisesModule } from '@/modules/exercises';
import { GoalServiceModule } from '@/modules/goal-service';
import { TrainingTemplatesModule } from '@/modules/traning-templates';
import { TrainingsModule } from '@/modules/tranings';
import { UsersModule } from '@/modules/users/users.module';
import { ObservabilityModule, LoggerModuleOptions } from '@big-d/api-utils';
import { HttpStatus, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { BaseHttpException, ExceptionWrongRpcResponse } from '@shared/exceptions';
import { ApiGatewayRequestContext } from '@shared/request-context';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { RpcResponseValidationModule } from '@shared/rpc-response-validation';
import { join } from 'node:path';

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
    PubSubModule,

    RpcResponseValidationModule.forFeature({
      useValue: ({ issues, message }) =>
        BaseHttpException.createFromBase(new ExceptionWrongRpcResponse({ issues, message }), HttpStatus.BAD_GATEWAY),
    }),

    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(__dirname, './infrastructure/graphql/schema.gql'),
      sortSchema: true,
      context: ({ req }) => ({ req }),
      playground: false,
      path: '/graphql',
      plugins: [ApolloServerPluginLandingPageLocalDefault({ embed: true })],
      subscriptions: {
        'graphql-ws': { path: '/graphql' },
      },
    }),

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
