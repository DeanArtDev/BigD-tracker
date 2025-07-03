import { CallHandler, ExecutionContext, NestInterceptor, Logger } from '@nestjs/common';
import { Observable, tap } from 'rxjs';

export class LoggingInterceptor implements NestInterceptor {
  private logger: Logger;

  constructor(data: { name: string }) {
    this.logger = new Logger(data.name);
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const pattern = context.getHandler()?.name || 'UnknownHandler';
    const cls = context.getClass().name;
    const args = context.getArgs()[0];
    const routingKey = context.getArgs()[1].args[2];

    return next.handle().pipe(
      tap(() => {
        this.logger.log(
          `[${cls}]:${pattern} routingKey:${routingKey}, args: ${JSON.stringify(args)}`,
        );
      }),
    );
  }
}
