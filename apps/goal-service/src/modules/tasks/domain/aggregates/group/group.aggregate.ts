import { DescriptionVo, ProgressVo } from '@/modules/tasks/domain';
import { ExceptionTaskDomainInvalidInvariant } from '@/modules/tasks/domain/exceptions';
import { GroupStatus } from '@big-d/api-contracts';
import { Name } from '@big-d/api-utils';
import { assertGroupUpdate } from './group.invariants';

interface GroupState {
  readonly id: number;
  readonly userId: number;
  readonly progress: ProgressVo;
  readonly status: GroupStatus;
  name: Name;
  description?: DescriptionVo;
}

interface GroupRestoreInput {
  readonly id: number;
  readonly userId: number;
  readonly name: Name;
  readonly description?: DescriptionVo;
  readonly progress: ProgressVo;
  readonly status: GroupStatus;
}

interface GroupUpdateInput {
  readonly name: Name;
  readonly description?: DescriptionVo;
}

interface GroupCreateInput {
  readonly userId: number;
  readonly name: Name;
  readonly description?: DescriptionVo;
}

class Group {
  #state: GroupState;

  private constructor(input: Readonly<GroupState>) {
    this.#state = input;
  }

  static create(input: GroupCreateInput): Group {
    return new Group({
      id: NaN,
      userId: input.userId,
      name: input.name,
      description: input.description,
      status: GroupStatus.NOT_STARTED,
      progress: ProgressVo.defaultValue(),
    });
  }

  public replace(input: GroupUpdateInput): this {
    assertGroupUpdate({ status: this.#state.status });

    this.#state.name = input.name;
    this.#state.description = input.description;

    return this;
  }

  static restore(input: GroupRestoreInput): Group {
    return new Group({
      id: input.id,
      userId: input.userId,
      name: input.name,
      description: input.description,
      status: input.status,
      progress: ProgressVo.defaultValue(),
    });
  }

  public delete(): this {
    if (this.#state.status === GroupStatus.DONE) {
      throw new ExceptionTaskDomainInvalidInvariant({
        message: `Group can't be delete if it's already done`,
        field: 'status',
      });
    }
    return this;
  }

  get id(): number {
    return this.#state.id;
  }

  get userId(): number {
    return this.#state.userId;
  }

  get name(): string {
    return this.#state.name.value;
  }

  get description(): string | undefined {
    return this.#state.description?.value;
  }

  get progress(): number {
    return this.#state.progress.value;
  }

  get status(): GroupStatus {
    return this.#state.status;
  }
}

export { Group, GroupCreateInput, GroupUpdateInput, GroupRestoreInput, GroupState };
