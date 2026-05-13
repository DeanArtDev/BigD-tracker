import { DateVo } from '@big-d/api-utils';
import { Session } from './session.aggregate';
import { SessionTokenHash } from '../value-objects';

interface SessionCreateInput {
  readonly userId: number;
  readonly expiresAt: string;
  readonly userAgent?: string;
  readonly ip?: string;
  readonly tokenHash: SessionTokenHash;
}

class SessionFactory {
  static create(input: SessionCreateInput): Session {
    return Session.create({
      userId: input.userId,
      expiresAt: DateVo.create(input.expiresAt),
      userAgent: input.userAgent,
      ip: input.ip,
      tokenHash: input.tokenHash,
    });
  }
}

export { SessionFactory };
