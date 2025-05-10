import { Global, Module } from "@nestjs/common";
import { KyselyDatabaseProvider } from "./database.kysely.provider";
import { KyselyService } from "./database.kysely.service";
import { ConfigModule } from "@nestjs/config";
import { dbConfigFactory } from "./config";

@Global()
@Module({
  imports: [ConfigModule.forRoot({ load: [dbConfigFactory] })],
  providers: [KyselyDatabaseProvider, KyselyService],
  exports: [KyselyService],
})
export class DatabaseModule {}
