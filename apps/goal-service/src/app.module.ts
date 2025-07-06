import { appConfigFactory, dbConfigFactory } from '@/infrastructure/configs';
import { RmqClientsModule } from '@/infrastructure/rmq-clients';
import { ThingsModule } from '@/modules/things';
import { DatabaseModule } from '@big-d/database';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    CqrsModule.forRoot(),
    RmqClientsModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfigFactory],
      envFilePath: ['.env.production', '.env.development'],
    }),
    DatabaseModule.forRootAsync(dbConfigFactory()),

    ThingsModule,
  ],
})
export class AppModule {}
