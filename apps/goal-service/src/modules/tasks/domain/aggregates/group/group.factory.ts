import { DescriptionVo } from '@/modules/tasks/domain';
import { Name } from '@big-d/api-utils';
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

  delete(group: Group): Group {
    return group.delete();
  }
}

export { GroupFactory };
