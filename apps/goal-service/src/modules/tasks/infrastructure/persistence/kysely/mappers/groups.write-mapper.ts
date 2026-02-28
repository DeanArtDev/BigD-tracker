import { TaskView } from '@/modules/tasks/application/dto';
import { Group, GroupWithTasks } from '@/modules/tasks/domain/aggregates/group';
import { DescriptionVo, ProgressVo } from '@/modules/tasks/domain/aggregates/value-objects';
import { GroupStatus } from '@big-d/api-contracts';
import { Name } from '@big-d/api-utils';

interface RawGroup {
  readonly id: number;
  readonly name: string;
  readonly description: string | null;
  readonly user_id: number;
  readonly progress: number;
  readonly status: GroupStatus;
}

interface RawGroupWithTasks extends RawGroup {
  readonly tasks: TaskView[];
}

class GroupWriteKyselyMapper {
  static fromRawToAgr(raw: RawGroup): Group {
    return Group.restore({
      id: raw.id,
      name: Name.restore(raw.name),
      description: raw.description != null ? DescriptionVo.restore(raw.description) : undefined,
      userId: raw.user_id,
      status: raw.status,
      progress: ProgressVo.restore(raw.progress),
    });
  }

  static fromRawToAgrWithTasks({ tasks, ...raw }: RawGroupWithTasks): GroupWithTasks {
    return GroupWithTasks.restore({
      group: this.fromRawToAgr(raw),
      tasks,
    });
  }
}

export { GroupWriteKyselyMapper };
