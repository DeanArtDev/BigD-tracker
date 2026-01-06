import { GroupInboxView } from '@/modules/tasks/application/dto/group-inbox.view';
import { GroupView } from '@/modules/tasks/application/dto/group.view';
import { GroupStatus } from '@big-d/api-contracts';

interface RawGroup {
  readonly id: number;
  readonly name: string;
  readonly description: string | null;
  readonly user_id: number;
  readonly progress: number;
  readonly status: string;
}

interface RawInboxGroup {
  readonly id: number;
  readonly name: string;
  readonly user_id: number;
}

class GroupReadKyselyMapper {
  static fromRawToView(raw: RawGroup): GroupView {
    return GroupView.restore({
      id: raw.id,
      name: raw.name,
      description: raw.description ?? undefined,
      userId: raw.user_id,
      progress: raw.progress,
      status: raw.status as GroupStatus,
    });
  }

  static fromRawToInboxView(raw: RawInboxGroup): GroupInboxView {
    return GroupInboxView.restore({
      id: raw.id,
      name: raw.name,
      userId: raw.user_id,
    });
  }
}

export { GroupReadKyselyMapper };
