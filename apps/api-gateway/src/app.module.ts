import { APP_ENV, appConfigFactory } from '@/infrastructure/configs';
import { SwaggerAuthModule } from '@/infrastructure/swagger-auth/swagger-auth.module';
import { AuthModule } from '@/modules/auth/auth.module';
import { ExercisesModule } from '@/modules/exercises';
import { GoalServiceModule } from '@/modules/goal-service';
import { TrainingTemplatesModule } from '@/modules/traning-templates';
import { TrainingsModule } from '@/modules/tranings';
import { UsersModule } from '@/modules/users/users.module';
import { ObservabilityModule, LoggerModuleOptions } from '@big-d/api-utils';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ApiGatewayRequestContext } from '@shared/request-context';

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
