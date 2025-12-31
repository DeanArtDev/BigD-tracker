import { getTokenPayloadFromRequest } from '@/modules/auth/decorators';
import { GOAL_SERVICE_RMQ_KEY } from '@big-d/api-contracts';
import { Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { ClientProxy, RmqRecordBuilder } from '@nestjs/microservices';
import { randomUUID } from 'crypto';
import { Request } from 'express';
import { Observable } from 'rxjs';

@Injectable({ scope: Scope.REQUEST })
export class GoalServiceClientProxy {
  constructor(
    @Inject(REQUEST) private readonly req: Request,
    @Inject(GOAL_SERVICE_RMQ_KEY) private readonly goalClient: ClientProxy,
  ) {}

  public send<TResult = any, TInput = any>(pattern: any, payload: TInput): Observable<TResult> {
    const cid = this.req.headers['x-correlation-id']?.toString() ?? randomUUID();
    const { uid } = getTokenPayloadFromRequest(this.req);

    const builtPayload = new RmqRecordBuilder<TInput>(payload)
      .setOptions({
        headers: { 'x-correlation-id': cid, 'x-token-payload': JSON.stringify({ uid }) },
      })
      .build();

    return this.goalClient.send<TResult, TInput>(pattern, builtPayload as TInput);
  }
}
