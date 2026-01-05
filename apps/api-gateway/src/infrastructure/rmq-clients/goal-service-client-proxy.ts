import { TOKEN_PAYLOAD_HEADER_KEY } from '@/infrastructure/rmq-clients/constants';
import { getTokenPayloadFromRequest } from '@/modules/auth/decorators';
import { GOAL_SERVICE_RMQ_KEY } from '@big-d/api-contracts';
import { Inject, Injectable } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { ClientProxy, RmqRecordBuilder } from '@nestjs/microservices';
import { CORRELATION_HEADER_KEY } from '@shared/interceptors/observability.interceptor';
import { randomUUID } from 'crypto';
import { Request } from 'express';
import { Observable } from 'rxjs';

@Injectable()
export class GoalServiceClientProxy {
  constructor(
    @Inject(REQUEST) private readonly req: Request,
    @Inject(GOAL_SERVICE_RMQ_KEY) private readonly goalClient: ClientProxy,
  ) {}

  public send<TResult = any, TInput = any>(pattern: any, payload: TInput): Observable<TResult> {
    const cid = this.req.headers[CORRELATION_HEADER_KEY]?.toString() ?? randomUUID();
    const { uid } = getTokenPayloadFromRequest(this.req);

    const builtPayload = new RmqRecordBuilder<TInput>(payload)
      .setOptions({
        headers: {
          [CORRELATION_HEADER_KEY]: cid,
          [TOKEN_PAYLOAD_HEADER_KEY]: JSON.stringify({ uid }),
        },
      })
      .build();

    return this.goalClient.send<TResult, TInput>(pattern, builtPayload as TInput);
  }
}
