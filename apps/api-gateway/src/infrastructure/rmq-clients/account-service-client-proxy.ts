import { ExceptionRpcRequestTimeout } from '@/infrastructure/rmq-clients/exceptions';
import { ACCOUNT_SERVICE_RMQ_KEY } from '@big-d/api-contracts';
import { Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { ClientProxy } from '@nestjs/microservices';
import { Request } from 'express';
import { send } from './helpers/client-send.method';

const TIMEOUT_MS = 5000;

@Injectable({ scope: Scope.REQUEST })
export class AccountServiceClientProxy {
  constructor(
    @Inject(REQUEST) private readonly req: Request,
    @Inject(ACCOUNT_SERVICE_RMQ_KEY) private readonly goalClient: ClientProxy,
  ) {}

  public async send<TResult = any, TInput = any>(pattern: any, payload: TInput): Promise<TResult> {
    return send(pattern, payload, {
      client: this.goalClient,
      req: this.req,
      timeout: TIMEOUT_MS,
      onTimeoutError: () =>
        new ExceptionRpcRequestTimeout({
          message: `account service RPC timeout (${TIMEOUT_MS}ms)`,
        }),
    });
  }
}
