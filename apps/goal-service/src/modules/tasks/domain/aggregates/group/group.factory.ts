import { DescriptionVo, Task, TaskFactory, TaskFactoryReplaceInput } from '@/modules/tasks/domain';
import { HtmlSanitizer } from '@/modules/tasks/domain/ports';
import { Name } from '@big-d/api-utils';
import { GroupWithTasks } from './group-with-tasks.aggregate';
import { Group } from './group.aggregate';

interface GroupFactoryCreateInput {
  readonly userId: number;
  readonly name: string;
  readonly description?: string;
}

interface GroupFactoryReplaceInput {
  readonly id: number;
  readonly userId: number;
  readonly name: string;
  readonly description?: string;
}

interface GroupFactoryReplaceWithTasksInput extends GroupFactoryReplaceInput {
  readonly tasks: { task: Task; input: TaskFactoryReplaceInput }[];
}

class GroupFactory {
  constructor(private readonly options: { sanitizer: HtmlSanitizer }) {}

  create(input: GroupFactoryCreateInput): Group {
    return Group.create({
      userId: input.userId,
      name: Name.create(input.name),
      description:
        input.description != null
          ? DescriptionVo.create(this.options.sanitizer.sanitize(input.description))
          : undefined,
    });
  }

  replace(group: Group, input: GroupFactoryReplaceInput): Group {
    return group.replace({
      id: input.id,
      userId: input.userId,
      name: Name.create(input.name),
      description:
        input.description != null
          ? DescriptionVo.create(this.options.sanitizer.sanitize(input.description))
          : undefined,
    });
  }

  replaceWithTasksByGroup(group: Group, input: GroupFactoryReplaceWithTasksInput): GroupWithTasks {
    const { tasks, ...others } = input;

    const replacedGroup = this.replace(group, others);

    return GroupWithTasks.restore({ group: replacedGroup, tasks: [] }).replace({
      group: replacedGroup,
      tasks: tasks.map((task) => TaskFactory.replace(task.task, task.input)),
    });
  }
}

export { GroupFactory, GroupFactoryReplaceWithTasksInput };
