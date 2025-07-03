import { DomainValidator } from '@big-d/api-utils';
import { randomBytes } from 'crypto';

const validator = new DomainValidator('sessions');

interface SessionEntityData {
  readonly uuid: string;
  readonly userId: number;
  readonly token: string;
  expiresAt: string;
  readonly ip?: string;
  readonly revoked: boolean;
  readonly userAgent?: string;
}

interface CreateSessionEntityData {
  readonly uuid: string;
  readonly ip?: string;
  readonly userId: number;
  readonly userAgent?: string;
}

const EMPTY_EXPIRED_DATE = '';

class SessionEntity {
  #data: SessionEntityData;

  static create(data: CreateSessionEntityData) {
    return new SessionEntity({
      uuid: data.uuid,
      token: randomBytes(40).toString('hex'),
      revoked: false,
      ip: data.ip,
      userId: data.userId,
      expiresAt: EMPTY_EXPIRED_DATE,
      userAgent: data.userAgent,
    });
  }

  static restore(data: SessionEntityData) {
    return new SessionEntity(data);
  }

  private constructor(data: SessionEntityData) {
    this.#data = data;
  }

  public setExpirationDate(date: Date) {
    if (this.#data.expiresAt !== EMPTY_EXPIRED_DATE) {
      validator.throwError(
        `Session: ${this.#data.uuid} has already an expire date`,
        'setExpirationDate',
      );
    }
    validator.isDateAfter(date.toISOString(), new Date().toISOString(), 'setExpirationDate');
    this.#data.expiresAt = date.toISOString();
    return this;
  }

  get isExpired() {
    return new Date() > new Date(this.#data.expiresAt);
  }

  get uuid() {
    return this.#data.uuid;
  }
  get userId() {
    return this.#data.userId;
  }
  get token() {
    return this.#data.token;
  }
  get expiresAt() {
    return this.#data.expiresAt;
  }
  get ip() {
    return this.#data.ip;
  }
  get revoked() {
    return this.#data.revoked;
  }
  get userAgent() {
    return this.#data.userAgent;
  }
}

export { SessionEntity };
