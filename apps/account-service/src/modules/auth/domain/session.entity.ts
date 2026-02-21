import { DateVo, DomainValidator } from '@big-d/api-utils';
import { randomBytes } from 'crypto';

const validator = new DomainValidator('sessions');

interface SessionEntityData {
  readonly uuid: string;
  readonly userId: number;
  readonly token: string;
  readonly expiresAt: DateVo;
  readonly ip?: string;
  readonly revoked: boolean;
  readonly userAgent?: string;
}

interface CreateSessionEntityData {
  readonly uuid: string;
  readonly ip?: string;
  readonly userId: number;
  readonly userAgent?: string;
  readonly expiresAt: DateVo;
}

class SessionEntity {
  #data: SessionEntityData;

  static create(data: CreateSessionEntityData) {
    return new SessionEntity({
      uuid: data.uuid,
      token: randomBytes(40).toString('hex'),
      revoked: false,
      ip: data.ip,
      userId: data.userId,
      expiresAt: data.expiresAt,
      userAgent: data.userAgent,
    }).validate();
  }

  static restore(data: SessionEntityData) {
    return new SessionEntity(data);
  }

  private constructor(data: SessionEntityData) {
    this.#data = data;
  }

  public validate() {
    const { expiresAt } = this.#data;
    validator.isDateAfter(expiresAt.value, new Date().toISOString(), 'setExpirationDate');
    return this;
  }

  get isExpired() {
    const now = DateVo.create(new Date());
    return this.#data.expiresAt.equals(now) || this.#data.expiresAt.isBefore(now.value);
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
    return this.#data.expiresAt.value;
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
