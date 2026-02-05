import { availableTransitionsByTaskStatuses } from '@/modules/tasks/domain';
import { ExceptionTaskDomainInvalidInvariant } from '@/modules/tasks/domain/exceptions';
import { TaskStatus } from '@big-d/api-contracts';
import { DateVo } from '@big-d/api-utils';
import { AggregateRoot } from '@nestjs/cqrs';
import {
  assertDeadlineInThePast,
  assertFinishTask,
  assertStartDateNotInThePast,
  assertTaskAssignToGroup,
  assertTaskDates,
  assertTaskDeleteSoft,
  assertTaskReplace,
  assertTaskUnassignFromGroup,
} from './tasks.invariants';
import { TaskCreateInput, TaskReplaceInput, TaskRestoreInput, TaskState } from './tasks.types';

class Task extends AggregateRoot {
  #state: TaskState;

  private constructor(input: Readonly<TaskState>) {
    super();

    this.#state = input;
  }

  static create(input: TaskCreateInput): Task {
    assertStartDateNotInThePast({ start: input.startDate });
    assertDeadlineInThePast({ deadline: input.deadline });
    assertTaskDates({ start: input.startDate, deadline: input.deadline });

    return new Task({
      id: NaN,
      userId: input.userId,
      name: input.name,
      description: input.description,
      priority: input.priority,
      weight: input.weight,
      startDate: input.startDate,
      deadline: input.deadline,
      status: TaskStatus.NOT_STARTED,
      recurrence: input.recurrence,
    });
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

  #setStatus(status: TaskStatus): this {
    if (status === this.#state.status) return this;
    if (availableTransitionsByTaskStatuses[this.#state.status].includes(status)) {
      this.#state.status = status;
      return this;
    }

    throw new ExceptionTaskDomainInvalidInvariant({
      message: `Task status transition is unavailable from:{${this.#state.status} to:{${status}} status`,
      field: 'status',
    });
  }

  #changeBlock() {
    if (this.#state.endDate != null) {
      throw new ExceptionTaskDomainInvalidInvariant({
        message: `Task can't be changed after ending`,
        field: 'endDate',
      });
    }
  }

  public replace(input: TaskReplaceInput): this {
    this.#changeBlock();
    assertTaskReplace({ status: this.#state.status, endDate: this.#state.endDate?.value });
    assertTaskDates({ start: input.startDate, deadline: input.deadline });

    if (input.startDate?.value != null) {
      this.#setStatus(TaskStatus.IN_PROGRESS);
    }

    this.#state.name = input.name;
    this.#state.description = input.description;
    this.#state.priority = input.priority;
    this.#state.weight = input.weight;
    this.#state.startDate = input.startDate;
    this.#state.deadline = input.deadline;
    this.#state.recurrence = input.recurrence;

    return this;
  }

  public deleteSoft(): this {
    assertTaskDeleteSoft({ status: this.#state.status });
    this.#changeBlock();
    return this.#setStatus(TaskStatus.DELETED);
  }

  public assignToGroup(status?: TaskStatus.NOT_STARTED): this {
    this.#changeBlock();
    assertTaskAssignToGroup({ status: this.#state.status });

    if (status === TaskStatus.NOT_STARTED) {
      this.#state.startDate = undefined;
      this.#state.endDate = undefined;
      this.#state.recurrence = undefined;
    }

    if (status != null) {
      return this.#setStatus(status);
    }
    return this;
  }

  public unassignFromGroup(): this {
    this.#changeBlock();
    assertTaskUnassignFromGroup({ status: this.#state.status });
    return this;
  }

  public clone(): Task {
    let status = this.#state.status;
    if (
      [
        TaskStatus.COMPLETED,
        TaskStatus.OVERDUE,
        TaskStatus.CANCELLED,
        TaskStatus.ARCHIVED,
        TaskStatus.DELETED,
      ].includes(status)
    ) {
      status = TaskStatus.NOT_STARTED;
    }

    return new Task({
      id: NaN,
      userId: this.#state.userId,
      name: this.#state.name,
      description: this.#state.description,
      priority: this.#state.priority,
      weight: this.#state.weight,
      startDate: this.#state.startDate,
      deadline: this.#state.deadline,
      status,
      recurrence: this.#state.recurrence,
    });
  }

  /**
   * Дело можно завершить даже когда оно просрочено
   * */
  public finish() {
    assertFinishTask({ status: this.#state.status });
    this.#state.startDate = this.#state.startDate ?? DateVo.create(new Date());
    this.#state.endDate = DateVo.create(new Date());

    if (this.#state.deadline != null && this.#state.deadline.isBefore(new Date())) {
      this.#setStatus(TaskStatus.OVERDUE);
    } else {
      this.#setStatus(TaskStatus.COMPLETED);
    }

    return this;
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
}

export { Task };
