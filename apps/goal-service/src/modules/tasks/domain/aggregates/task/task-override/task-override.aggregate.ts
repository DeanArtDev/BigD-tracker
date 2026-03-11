import { TaskOverrideType, TaskStatus } from '@big-d/api-contracts';
import { assertStartDateIsRequired, taskAsserts } from '../tasks.invariants';
import {
  TaskOverrideCreateInput,
  TaskOverrideReplaceInput,
  TaskOverrideRestoreInput,
  TaskOverrodeState,
} from './task-override.types';

class TaskOverride {
  #state: TaskOverrodeState;

  private constructor(input: Readonly<TaskOverrodeState>) {
    this.#state = input;
  }

  static create(input: TaskOverrideCreateInput): TaskOverride {
    const { task, type, recurrenceStart, recurrenceId } = input;

    const assertInput = { taskId: task.id, startDate: task.startDate };
    assertStartDateIsRequired(assertInput);

    return new TaskOverride({
      id: NaN,
      recurrenceId,
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
      recurrenceStart,
    });
  }

  static restore(input: TaskOverrideRestoreInput): TaskOverride {
    const { task, type, recurrenceStart, recurrenceId } = input;

    const assertInput = { taskId: task.id, startDate: task.startDate };
    assertStartDateIsRequired(assertInput);
    taskAsserts.notDraft(task);

    return new TaskOverride({
      recurrenceStart,
      recurrenceId,
      id: task.id,
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

  public replace(input: TaskOverrideReplaceInput): TaskOverride {
    const { task, type } = input;

    const assertInput = { taskId: task.id, startDate: task.startDate };
    assertStartDateIsRequired(assertInput);
    taskAsserts.notDraft(task);

    this.#state.type = type;
    this.#state.name = task.name;
    this.#state.description = task.description;
    this.#state.priority = task.priority;
    this.#state.weight = task.weight;
    this.#state.cancelReason = task.cancelReason;
    this.#state.startDate = assertInput.startDate;
    this.#state.endDate = task.endDate;
    this.#state.deadline = task.deadline;
    this.#state.status = task.status;

    return this;
  }

  public delete(): TaskOverride {
    this.#state.type = TaskOverrideType.DELETED;
    this.#state.status = TaskStatus.DELETED;

    return this;
  }

  get id() {
    return this.#state.id;
  }
  get recurrenceId() {
    return this.#state.recurrenceId;
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
  get recurrenceStart() {
    return this.#state.recurrenceStart.value;
  }

  get isOverride() {
    return this.type === TaskOverrideType.OVERRIDE;
  }
  get isArchived() {
    return this.type === TaskOverrideType.ARCHIVED;
  }
  get isCancelled() {
    return this.type === TaskOverrideType.CANCELED;
  }
  get isDeleted() {
    return this.type === TaskOverrideType.DELETED;
  }
  get isMoved() {
    return this.type === TaskOverrideType.MOVED;
  }
  get isDraft() {
    return Number.isNaN(this.#state.id);
  }
}

export { TaskOverride };
