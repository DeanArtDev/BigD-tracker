import { TaskView } from '@/modules/tasks/application/dto/task.view';
import { DescriptionVo, ProgressVo } from '@/modules/tasks/domain';
import { GroupStatus } from '@big-d/api-contracts';
import { Name } from '@big-d/api-utils';

interface GroupState {
  readonly id: number;
  readonly userId: number;
  readonly progress: ProgressVo;
  readonly status: GroupStatus;
  readonly tasks: TaskView[];
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
  readonly tasks: TaskView[];
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
      tasks: [],
    });
  }

  static restore(input: GroupRestoreInput): Group {
    return new Group({
      id: input.id,
      userId: input.userId,
      name: input.name,
      description: input.description,
      status: GroupStatus.NOT_STARTED,
      progress: ProgressVo.defaultValue(),
      tasks: [],
    });
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

  get tasks(): TaskView[] {
    return this.#state.tasks;
  }
}

export { Group };
