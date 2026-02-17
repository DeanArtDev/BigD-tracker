import { randomUUID } from 'crypto';
import { merge } from 'lodash';

interface RequestContextState {
  correlationId?: string;
  readonly userId?: number;
  readonly source: 'http' | 'rmq' | string;
  readonly subjectId?: string;
  readonly initiator?: 'user' | 'system';
}

class RequestContext<TDetails extends RequestContextState = RequestContextState> {
  #state: TDetails & { correlationId: string };

  constructor(state: TDetails) {
    this.#state = { ...state, correlationId: state.correlationId ?? (randomUUID() as string) };
  }

  get correlationId(): string {
    return this.#state.correlationId;
  }

  get userId(): number | undefined {
    return this.#state?.userId;
  }

  get state(): RequestContextState {
    return this.#state;
  }

  public fork(state: TDetails): RequestContext<TDetails> {
    return new RequestContext<TDetails>(merge({}, this.#state, state));
  }
}

export { RequestContext, RequestContextState };
