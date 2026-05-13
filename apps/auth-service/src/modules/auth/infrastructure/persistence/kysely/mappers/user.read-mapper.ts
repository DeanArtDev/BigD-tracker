import { UserView } from '@/modules/auth/application/dto';
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

class UserReadKyselyMapper {
  static fromRawToView = (raw: RawUser): UserView => {
    return UserView.restore({
      id: raw.id,
      email: Email.restore(raw.email),
      type: raw.type,
      screenName: raw.screen_name ?? undefined,
      avatar: raw.avatar ?? undefined,
    });
  };
}

export { UserReadKyselyMapper };
