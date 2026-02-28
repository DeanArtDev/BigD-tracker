import { TasksViewMapper } from '@/modules/tasks/application/dto';
import { DescriptionVo, Task, TaskFactory, TaskFactoryReplaceInput } from '@/modules/tasks/domain';
import { Name } from '@big-d/api-utils';
import { GroupWithTasks } from './group-with-tasks.aggregate';
import { Group } from './group.aggregate';

interface GroupFactoryCreateInput {
  readonly userId: number;
  readonly name: string;
  readonly description?: string;
}

interface GroupFactoryReplaceInput {
  readonly name: string;
  readonly description?: string;
}

interface GroupFactoryReplaceWithTasksInput extends GroupFactoryReplaceInput {
  readonly tasks: { task: Task; input: TaskFactoryReplaceInput }[];
}

class GroupFactory {
  constructor() {}

  create(input: GroupFactoryCreateInput): Group {
    return Group.create({
      userId: input.userId,
      name: Name.create(input.name),
      description: input.description != null ? DescriptionVo.create(input.description) : undefined,
    });
  }

  replace(group: Group, input: GroupFactoryReplaceInput): Group {
    return group.replace({
      name: Name.create(input.name),
      description: input.description != null ? DescriptionVo.create(input.description) : undefined,
    });
  }

  replaceWithTasksByGroup(
    group: GroupWithTasks,
    input: GroupFactoryReplaceWithTasksInput,
  ): GroupWithTasks {
    const { tasks, ...others } = input;

    return group.replace({
      group: (group) => this.replace(group, others),
      tasks: tasks.map((task) =>
        TasksViewMapper.fromAggregateToView(TaskFactory.replace(task.task, task.input)),
      ),
    });
  }

  delete(group: GroupWithTasks): GroupWithTasks {
    return group.delete();
  }
}

export { GroupFactory, GroupFactoryReplaceWithTasksInput };
