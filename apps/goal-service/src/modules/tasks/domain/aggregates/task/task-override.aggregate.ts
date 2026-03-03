import { TaskOverrideType } from '@big-d/api-contracts';
import { TaskOverrideRestoreInput, TaskOverrodeState } from './task-override.types';

class TaskOverride {
  #state: TaskOverrodeState;

  private constructor(input: Readonly<TaskOverrodeState>) {
    this.#state = input;
  }

  static restore(input: TaskOverrideRestoreInput): TaskOverride {
    return new TaskOverride({
      task: input.task,
      masterTaskId: input.masterTaskId,
      type: input.type,
    });
  }

  get id() {
    return this.#state.task.id;
  }
  get masterTaskId() {
    return this.#state.masterTaskId;
  }
  get type() {
    return this.#state.type;
  }
  get userId() {
    return this.#state.task.userId;
  }
  get groupId() {
    return this.#state.task.groupId;
  }
  get name() {
    return this.#state.task.name;
  }
  get description() {
    return this.#state.task.description;
  }
  get priority() {
    return this.#state.task.priority;
  }
  get weight() {
    return this.#state.task.weight;
  }
  get cancelReason() {
    return this.#state.task.cancelReason;
  }
  get startDate() {
    return this.#state.task.startDate;
  }
  get endDate() {
    return this.#state.task.endDate;
  }
  get deadline() {
    return this.#state.task.deadline;
  }
  get status() {
    return this.#state.task.status;
  }

  get isOverride() {
    return this.#state.type === TaskOverrideType.OVERRIDE;
  }
  get isArchived() {
    return this.#state.type === TaskOverrideType.ARCHIVED;
  }
  get isCancelled() {
    return this.#state.type === TaskOverrideType.CANCELED;
  }
  get isDeleted() {
    return this.#state.type === TaskOverrideType.DELETED;
  }
  get isMoved() {
    return this.#state.type === TaskOverrideType.MOVED;
  }
}

export { TaskOverride };
