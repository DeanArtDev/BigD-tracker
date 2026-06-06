import {
  GroupInboxView,
  GroupView,
  GroupWithTasksView,
  GroupDetailedView,
  TaskView,
  GroupInfoView,
} from '@/modules/tasks/application/dto';
import { GroupStatus } from '@big-d/api-contracts';

interface RawGroup {
  readonly id: number;
  readonly name: string;
  readonly description: string | null;
  readonly user_id: number;
  readonly progress: number;
  readonly status: GroupStatus;
}

interface RawGroupInfo {
  readonly id: number;
  readonly name: string;
}

interface RawGroupWithTasks extends RawGroup {
  readonly tasks: TaskView[];
}

interface RawInboxGroup {
  readonly id: number;
  readonly name: string;
  readonly user_id: number;
  readonly task_count: number;
}

class GroupReadKyselyMapper {
  static fromRawToView(raw: RawGroup): GroupView {
    return GroupView.restore({
      id: raw.id,
      name: raw.name,
      description: raw.description ?? undefined,
      userId: raw.user_id,
      progress: raw.progress,
      status: raw.status,
    });
  }

  static fromRawToInfoView(raw: RawGroupInfo): GroupInfoView {
    return GroupInfoView.restore({
      id: raw.id,
      name: raw.name,
    });
  }

  static fromRawToWithTaskView(raw: RawGroupWithTasks): GroupWithTasksView {
    return GroupWithTasksView.restore({
      tasks: raw.tasks,
      group: GroupReadKyselyMapper.fromRawToView({
        id: raw.id,
        name: raw.name,
        description: raw.description,
        user_id: raw.user_id,
        progress: raw.progress,
        status: raw.status,
      }),
    });
  }

  static fromRawToDetailedView(raw: RawGroupWithTasks): GroupDetailedView {
    return GroupDetailedView.restore({
      tasks: raw.tasks,
      group: GroupReadKyselyMapper.fromRawToView({
        id: raw.id,
        name: raw.name,
        description: raw.description,
        user_id: raw.user_id,
        progress: raw.progress,
        status: raw.status,
      }),
    });
  }

  static fromRawToInboxView(raw: RawInboxGroup): GroupInboxView {
    return GroupInboxView.restore({
      id: raw.id,
      name: raw.name,
      userId: raw.user_id,
      taskCount: raw.task_count,
    });
  }
}

export { GroupReadKyselyMapper, RawGroup, RawGroupWithTasks, RawInboxGroup };
