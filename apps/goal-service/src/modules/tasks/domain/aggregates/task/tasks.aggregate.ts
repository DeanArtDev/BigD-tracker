import { TaskStatus } from '@big-d/api-contracts';
import { DateVo } from '@big-d/api-utils';
import { AggregateRoot } from '@nestjs/cqrs';
import { ExceptionTaskDomainInvalidInvariant } from '../../exceptions';
import {
  allowedTaskStatusByAction,
  allowTaskStatusTransitions,
  TaskStatusActions,
} from '../../specifications';
import { taskAsserts } from './tasks.invariants';
import { TaskCreateInput, TaskReplaceInput, TaskRestoreInput, TaskState } from './tasks.types';

class Task extends AggregateRoot {
  #state: TaskState;

  private constructor(input: Readonly<TaskState>) {
    super();

    this.#state = input;
  }

  static calculateStatusByDates({
    startDate,
    endDate,
    deadline,
  }: {
    startDate?: DateVo;
    deadline?: DateVo;
    endDate?: DateVo;
  }): TaskStatus {
    if (endDate) {
      return deadline?.isBefore(new Date()) ? TaskStatus.OVERDUE : TaskStatus.COMPLETED;
    }

    if (startDate) return TaskStatus.IN_PROGRESS;
    return TaskStatus.NOT_STARTED;
  }

  static restore(input: TaskRestoreInput): Task {
    return new Task({
      id: input.id,
      userId: input.userId,
      name: input.name,
      description: input.description,
      priority: input.priority,
      weight: input.weight,
      cancelReason: input.cancelReason,
      startDate: input.startDate,
      endDate: input.endDate,
      deadline: input.deadline,
      status: input.status,
      recurrence: input.recurrence,
    });
  }

  static create(input: TaskCreateInput): Task {
    taskAsserts.startDateInThePast({ start: input.startDate });
    taskAsserts.deadlineInThePast({ deadline: input.deadline });
    taskAsserts.datesIntersections({ start: input.startDate, deadline: input.deadline });

    return new Task({
      id: NaN,
      userId: input.userId,
      name: input.name,
      description: input.description,
      priority: input.priority,
      weight: input.weight,
      startDate: input.startDate,
      deadline: input.deadline,
      status: Task.calculateStatusByDates({ startDate: input.startDate }),
      recurrence: input.recurrence,
    });
  }

  public replace(input: TaskReplaceInput): this {
    taskAsserts.datesIntersections({ start: input.startDate, deadline: input.deadline });

    // возможность обновлять name and description на любом статусе кроме DELETED

    if (this.#isAllowTo('REPLACE')) {
      this.#state.status = Task.calculateStatusByDates({ startDate: input.startDate });
      this.#state.name = input.name;
      this.#state.description = input.description;
      this.#state.priority = input.priority;
      this.#state.weight = input.weight;
      this.#state.startDate = input.startDate;
      this.#state.deadline = input.deadline;
      this.#state.recurrence = input.recurrence;

      return this;
    }

    throw new ExceptionTaskDomainInvalidInvariant({
      message: `Task can't be updated at current status: ${this.#state.status}`,
      field: 'status',
      taskId: this.#state.id,
    });
  }

  public deleteSoft(): this {
    if (this.#isAllowTo('DELETE')) {
      return this.#setStatus(TaskStatus.DELETED);
    }

    throw new ExceptionTaskDomainInvalidInvariant({
      message: `Task can't be deleted at current status: ${this.#state.status}`,
      field: 'status',
      taskId: this.#state.id,
    });
  }

  public assignToGroup({ reset = false }: { reset?: boolean } = {}): this {
    if (this.#isAllowTo('ASSIGN')) {
      if (reset) {
        this.#state.startDate = undefined;
        this.#state.deadline = undefined;
        this.#state.recurrence = undefined;
      }
      return this;
    }

    throw new ExceptionTaskDomainInvalidInvariant({
      message: `Task can't be assigned at current status: ${this.#state.status}`,
      field: 'status',
      taskId: this.#state.id,
    });
  }

  public unassignFromGroup(): this {
    if (this.#isAllowTo('UNASSIGN')) {
      return this;
    }

    throw new ExceptionTaskDomainInvalidInvariant({
      message: `Task can't be unassigned at current status: ${this.#state.status}`,
      field: 'status',
      taskId: this.#state.id,
    });
  }

  public clone(): Task {
    if (this.#isAllowTo('CLONE')) {
      return new Task({
        id: NaN,
        userId: this.#state.userId,
        name: this.#state.name,
        description: this.#state.description,
        priority: this.#state.priority,
        weight: this.#state.weight,
        startDate: undefined,
        deadline: undefined,
        recurrence: undefined,
        status: TaskStatus.NOT_STARTED,
      });
    }

    throw new ExceptionTaskDomainInvalidInvariant({
      message: `Task can't be cloned at current status: ${this.#state.status}`,
      field: 'status',
      taskId: this.#state.id,
    });
  }

  public finish() {
    if (this.#isAllowTo('FINISH')) {
      this.#state.endDate = DateVo.create(new Date());
      this.#state.startDate = this.#state.startDate ?? DateVo.create(new Date());

      this.#setStatus(
        Task.calculateStatusByDates({
          startDate: this.#state.startDate,
          deadline: this.#state.deadline,
          endDate: this.#state.endDate,
        }),
      );

      return this;
    }

    throw new ExceptionTaskDomainInvalidInvariant({
      message: `Task can't be finished at current status: ${this.#state.status}`,
      field: 'status',
      taskId: this.#state.id,
    });
  }

  get id() {
    return this.#state.id;
  }
  get userId() {
    return this.#state.userId;
  }
  get name() {
    return this.#state.name.value;
  }
  get description() {
    return this.#state.description;
  }
  get priority() {
    return this.#state.priority.value;
  }
  get weight() {
    return this.#state.weight.value;
  }
  get cancelReason() {
    return this.#state.cancelReason;
  }
  get startDate() {
    return this.#state.startDate?.value;
  }
  get endDate() {
    return this.#state.endDate?.value;
  }
  get deadline() {
    return this.#state.deadline?.value;
  }
  get status() {
    return this.#state.status;
  }
  get recurrence() {
    return this.#state.recurrence;
  }
  get isDraft(): boolean {
    return Number.isNaN(this.#state.id);
  }

  get isNotStarted(): boolean {
    return this.#state.status === TaskStatus.NOT_STARTED && this.#state.startDate == null;
  }

  get isInProgress(): boolean {
    return this.#state.status === TaskStatus.IN_PROGRESS && this.#state.startDate != null;
  }

  get isFinished(): boolean {
    return (
      this.#state.endDate != null &&
      [TaskStatus.COMPLETED, TaskStatus.OVERDUE].includes(this.#state.status)
    );
  }

  #isAllowTo(action: TaskStatusActions): boolean {
    return allowedTaskStatusByAction[action].includes(this.#state.status);
  }

  #setStatus(status: TaskStatus): this {
    if (status === this.#state.status) return this;
    if (allowTaskStatusTransitions[this.#state.status].includes(status)) {
      this.#state.status = status;
      return this;
    }

    throw new ExceptionTaskDomainInvalidInvariant({
      message: `Task status transition is unavailable from:{${this.#state.status} to:{${status}} status`,
      field: 'status',
      taskId: this.#state.id,
    });
  }
}

export { Task };
