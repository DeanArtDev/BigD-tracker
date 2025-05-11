import { Controller, Get } from '@nestjs/common';
import { KyselyService } from '@shared/modules/db';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly kyselyService: KyselyService,
  ) {}

  @Get('/health-check')
  async healthCheck() {
    const data = await this.kyselyService.db.selectFrom('users').selectAll().execute();

    return { data };
  }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
