import { Session } from '@/modules/auth/domain/aggreates';
import { SessionTokenHash } from '@/modules/auth/domain/value-objects';
import { DateVo } from '@big-d/api-utils';

interface RawSession {
  readonly id: number;
  readonly user_id: number;
  readonly expires_at: Date;
  readonly token_hash: string;
  readonly revoked: boolean;
  readonly ip?: string | null;
  readonly user_agent?: string | null;
}

class SessionWriteKyselyMapper {
  static fromRawToAgr = (raw: RawSession): Session => {
    return Session.restore({
      id: raw.id,
      userId: raw.user_id,
      expiresAt: DateVo.restore(raw.expires_at.toISOString()),
      revoked: raw.revoked,
      tokenHash: SessionTokenHash.restore(raw.token_hash),
      userAgent: raw.user_agent ?? undefined,
      ip: raw.ip ?? undefined,
    });
  };
}

export { SessionWriteKyselyMapper };
