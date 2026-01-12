import { GroupInboxView, GroupView, TaskView } from '@/modules/tasks/application/dto';
import { DescriptionVo, ProgressVo } from '@/modules/tasks/domain';
import { Group } from '@/modules/tasks/domain/aggregates/group';
import { GroupStatus } from '@big-d/api-contracts';
import { Name } from '@big-d/api-utils';

interface RawGroup {
  readonly id: number;
  readonly name: string;
  readonly description: string | null;
  readonly user_id: number;
  readonly progress: number;
  readonly status: GroupStatus;
  readonly tasks: TaskView[];
}

interface RawInboxGroup {
  readonly id: number;
  readonly name: string;
  readonly user_id: number;
  readonly tasks: TaskView[];
}

class GroupReadKyselyMapper {
  static fromRawToAgr(raw: RawGroup): Group {
    return Group.restore({
      id: raw.id,
      name: Name.restore(raw.name),
      description: raw.description != null ? DescriptionVo.restore(raw.description) : undefined,
      userId: raw.user_id,
      status: raw.status,
      progress: ProgressVo.restore(raw.progress),
      tasks: raw.tasks,
    });
  }

  static fromRawToView(raw: RawGroup): GroupView {
    return GroupView.restore({
      id: raw.id,
      name: raw.name,
      description: raw.description ?? undefined,
      userId: raw.user_id,
      progress: raw.progress,
      status: raw.status,
      tasks: raw.tasks,
    });
  }

  static fromRawToInboxView(raw: RawInboxGroup): GroupInboxView {
    return GroupInboxView.restore({
      id: raw.id,
      name: raw.name,
      userId: raw.user_id,
      tasks: raw.tasks,
    });
  }
}

export { GroupReadKyselyMapper };
