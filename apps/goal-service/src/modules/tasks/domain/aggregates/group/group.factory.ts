import { DescriptionVo } from '@/modules/tasks/domain';
import { HtmlSanitizer } from '@/modules/tasks/domain/ports';
import { Name } from '@big-d/api-utils';
import { Group } from './group.aggregate';

interface GroupFactoryCreateInput {
  readonly userId: number;
  readonly name: string;
  readonly description?: string;
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
}

export { GroupFactory };
