import { User } from '@/modules/auth/domain/aggreates';
import { UserPasswordHash } from '@/modules/auth/domain/value-objects';
import { UserType } from '@big-d/api-contracts';
import { Email } from '@big-d/api-utils';

interface RawUser {
  readonly id: number;
  readonly email: string;
  readonly type: UserType;
  readonly password_hash: string;
  readonly screen_name?: string | null;
  readonly avatar?: string | null;
}

class UserWriteKyselyMapper {
  static fromRawToAgr = (raw: RawUser): User => {
    return User.restore({
      id: raw.id,
      email: Email.restore(raw.email),
      passwordHash: UserPasswordHash.restore(raw.password_hash),
      type: raw.type,
      screenName: raw.screen_name ?? undefined,
      avatar: raw.avatar ?? undefined,
    });
  };
}

export { UserWriteKyselyMapper };
