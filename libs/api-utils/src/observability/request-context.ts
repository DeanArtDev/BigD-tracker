import { randomUUID } from 'crypto';
import { merge } from 'lodash';

interface RequestContextInputState {
  correlationId?: string;
  userTimezone?: string;
  readonly userId?: number;
  readonly source: 'http' | 'rmq' | string;
  readonly subjectId?: string;
  readonly initiator?: 'user' | 'system';
}

interface RequestContextState extends Omit<RequestContextInputState, 'userTimezone' | 'correlationId'> {
  correlationId: string;
  userTimezone: string;
}

class RequestContext<TDetails extends RequestContextInputState = RequestContextInputState> {
  #state: Omit<TDetails, 'userTimezone' | 'correlationId'> & RequestContextState;

  constructor(state: TDetails) {
    this.#state = {
      ...state,
      correlationId: state.correlationId ?? (randomUUID() as string),
      userTimezone: state.userTimezone ?? 'UTC',
    };
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
export type { RequestContextInputState };
