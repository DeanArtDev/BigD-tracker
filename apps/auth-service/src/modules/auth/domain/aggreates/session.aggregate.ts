import { DateVo } from '@big-d/api-utils';
import { AggregateRoot } from '@nestjs/cqrs';
import { SessionTokenHash } from '../value-objects';

interface SessionState {
  readonly id: number;
  readonly userId: number;
  readonly revoked: boolean;
  readonly expiresAt: DateVo;
  readonly tokenHash: SessionTokenHash;
  readonly userAgent?: string;
  readonly ip?: string;
}

interface SessionRestoreInput {
  readonly id: number;
  readonly userId: number;
  readonly revoked: boolean;
  readonly expiresAt: DateVo;
  readonly tokenHash: SessionTokenHash;
  readonly userAgent?: string;
  readonly ip?: string;
}

interface SessionCreateInput {
  readonly userId: number;
  readonly expiresAt: DateVo;
  readonly userAgent?: string;
  readonly tokenHash: SessionTokenHash;
  readonly ip?: string;
}

class Session extends AggregateRoot {
  #state: SessionState;

  private constructor(input: Readonly<SessionState>) {
    super();

    this.#state = input;
  }

  static restore(input: SessionRestoreInput): Session {
    return new Session({
      id: input.id,
      userId: input.userId,
      revoked: input.revoked,
      expiresAt: input.expiresAt,
      ip: input.ip,
      userAgent: input.userAgent,
      tokenHash: input.tokenHash,
    });
  }

  static create(input: SessionCreateInput): Session {
    return new Session({
      id: NaN,
      userId: input.userId,
      revoked: false,
      expiresAt: input.expiresAt,
      ip: input.ip,
      userAgent: input.userAgent,
      tokenHash: input.tokenHash,
    });
  }

  get id() {
    return this.#state.id;
  }

  get userId() {
    return this.#state.userId;
  }
  get tokenHash() {
    return this.#state.tokenHash.value;
  }
  get revoked() {
    return this.#state.revoked;
  }
  get expiresAt() {
    return this.#state.expiresAt.value;
  }
  get userAgent() {
    return this.#state.userAgent;
  }
  get ip() {
    return this.#state.ip;
  }

  get isDraft(): boolean {
    return Number.isNaN(this.#state.id);
  }
}

export { Session };
