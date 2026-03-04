import { TaskOverrideType } from '@big-d/api-contracts';
import { TaskOverrideCreateInput, TaskOverrideRestoreInput, TaskOverrodeState } from './task-override.types';
import { assertStartDateIsRequired, taskAsserts } from './tasks.invariants';

class TaskOverride {
  #state: TaskOverrodeState;

  private constructor(input: Readonly<TaskOverrodeState>) {
    this.#state = input;
  }

  static create(input: TaskOverrideCreateInput): TaskOverride {
    const { task, type } = input;

    const assertInput = { taskId: task.id, startDate: task.startDate };
    assertStartDateIsRequired(assertInput);
    taskAsserts.notDraft(task);

    return new TaskOverride({
      masterTaskId: task.id,
      occurrenceStart: input.occurrenceStart.value,
      id: NaN,
      userId: task.userId,
      groupId: task.groupId,
      name: task.name,
      description: task.description,
      priority: task.priority,
      weight: task.weight,
      cancelReason: task.cancelReason,
      startDate: assertInput.startDate,
      endDate: task.endDate,
      deadline: task.deadline,
      status: task.status,
      type,
    });
  }

  static restore(input: TaskOverrideRestoreInput): TaskOverride {
    const { task, masterTaskId, type } = input;

    const assertInput = { taskId: task.id, startDate: task.startDate };
    assertStartDateIsRequired(assertInput);
    taskAsserts.notDraft(task);

    return new TaskOverride({
      id: task.id,
      occurrenceStart: input.occurrenceStart,
      userId: task.userId,
      groupId: task.groupId,
      name: task.name,
      description: task.description,
      priority: task.priority,
      weight: task.weight,
      cancelReason: task.cancelReason,
      startDate: assertInput.startDate,
      endDate: task.endDate,
      deadline: task.deadline,
      status: task.status,
      masterTaskId,
      type,
    });
  }

  get id() {
    return this.#state.id;
  }
  get masterTaskId() {
    return this.#state.masterTaskId;
  }
  get type() {
    return this.#state.type;
  }
  get userId() {
    return this.#state.userId;
  }
  get groupId() {
    return this.#state.groupId;
  }
  get name() {
    return this.#state.name;
  }
  get description() {
    return this.#state.description;
  }
  get priority() {
    return this.#state.priority;
  }
  get weight() {
    return this.#state.weight;
  }
  get cancelReason() {
    return this.#state.cancelReason;
  }
  get startDate() {
    return this.#state.startDate;
  }
  get endDate() {
    return this.#state.endDate;
  }
  get deadline() {
    return this.#state.deadline;
  }
  get status() {
    return this.#state.status;
  }
  get occurrenceStart() {
    return this.#state.occurrenceStart;
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
  get isDraft() {
    return Number.isNaN(this.#state.masterTaskId) || Number.isNaN(this.#state.id);
  }
}

export { TaskOverride };
