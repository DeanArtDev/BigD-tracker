import { Controller, Get, Post } from "@nestjs/common";
import { AppService } from "./app.service";
import { KyselyService } from "@shared/modules/db";

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly kyselyService: KyselyService,
  ) {}

  @Post("/users")
  async create() {
    const user = await this.kyselyService.db
      .insertInto("users")
      .values({
        name: "Alice",
        email: "alice@example.com",
      })
      .returning(["id", "created_at"])
      .executeTakeFirst();

    return { data: user };
  }

  @Get("/health-check")
  async healthCheck() {
    const data = await this.kyselyService.db
      .selectFrom("users")
      .selectAll()
      .execute();

    return { data };
  }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
