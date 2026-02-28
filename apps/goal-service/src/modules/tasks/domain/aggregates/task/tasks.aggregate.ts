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
import { Priority, RecurrenceVo, Weight } from './value-objects';

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
    if (endDate != null) {
      if (deadline == null) return TaskStatus.COMPLETED;

      const endOfDate = DateVo.create(new Date(new Date().setHours(23, 59, 59, 999)));
      return endOfDate.isBefore(deadline.value) || endOfDate.equals(deadline)
        ? TaskStatus.COMPLETED
        : TaskStatus.OVERDUE;
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
      endDate: input.endDate,
      status: input.status,
      recurrence: input.recurrence,
    });
  }

  static create(input: TaskCreateInput): Task {
    const { recurrence } = input;
    const { startDate } = recurrence?.value ?? {};

    return new Task({
      id: NaN,
      userId: input.userId,
      name: input.name,
      description: input.description,
      priority: input.priority,
      weight: input.weight,
      status: Task.calculateStatusByDates({ startDate }),
      recurrence: input.recurrence,
    });
  }

  public replace(input: TaskReplaceInput): this {
    const { recurrence } = input;
    const { startDate, deadline } = recurrence?.value ?? {};

    if (this.#isAllowTo('REPLACE_EVERYTHING')) {
      if (recurrence?.value?.frequency != null) {
        taskAsserts.neededRecurrenceFields({
          start: startDate,
          deadline: deadline,
        });
      }

      this.#state.status = Task.calculateStatusByDates({ startDate });
      this.#state.name = input.name;
      this.#state.description = input.description;
      this.#state.priority = input.priority;
      this.#state.weight = input.weight;
      this.#state.recurrence = input.recurrence;

      return this;
    }

    if (this.#isAllowTo('REPLACE_PARTLY')) {
      this.#state.name = input.name;
      this.#state.description = input.description;

      taskAsserts.partlyReplaceableFields(
        {
          id: this.#state.id,
          status: this.#state.status,
          priority: this.#state.priority,
          weight: this.#state.weight,
          recurrence: this.#state.recurrence,
        },
        {
          priority: input.priority,
          weight: input.weight,
          recurrence: input.recurrence,
        },
      );

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

  public deleteComplete(): this {
    if (this.#isAllowTo('DELETE_COMPLETE')) {
      return this;
    }

    throw new ExceptionTaskDomainInvalidInvariant({
      message: `Task can't be deleted complete at current status: ${this.#state.status}`,
      field: 'status',
      taskId: this.#state.id,
    });
  }

  public recovery(): this {
    if (this.#isAllowTo('RECOVERY')) {
      this.#state.priority = Priority.defaultValue();
      this.#state.weight = Weight.defaultValue();
      this.#state.recurrence = RecurrenceVo.create({
        frequency: undefined,
        deadline: undefined,
        startDate: undefined,
      });
      return this.#setStatus(TaskStatus.NOT_STARTED);
    }

    throw new ExceptionTaskDomainInvalidInvariant({
      message: `Task can't be recovery at current status: ${this.#state.status}`,
      field: 'status',
      taskId: this.#state.id,
    });
  }

  public assignToGroup({ reset = false }: { reset?: boolean } = {}): this {
    if (this.#isAllowTo('ASSIGN')) {
      if (reset) {
        const { deadline, startDate } = this.#state.recurrence?.value ?? {};

        this.#state.endDate = undefined;
        this.#state.recurrence = RecurrenceVo.create({
          frequency: undefined,
          deadline: undefined,
          startDate: undefined,
        });

        this.#setStatus(
          Task.calculateStatusByDates({ startDate, deadline, endDate: this.#state.endDate }),
        );
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
        recurrence: RecurrenceVo.create({
          frequency: undefined,
          deadline: undefined,
          startDate: undefined,
        }),
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
      const { deadline, startDate, frequency } = this.#state.recurrence?.value ?? {};

      this.#state.endDate = DateVo.create(new Date());
      taskAsserts.datesIntersections({ start: startDate, end: this.#state.endDate });

      this.#state.recurrence = RecurrenceVo.create({
        frequency,
        deadline,
        startDate: startDate ?? DateVo.create(new Date()),
      });

      this.#setStatus(
        Task.calculateStatusByDates({
          startDate,
          deadline,
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
  get groupId() {
    return this.#state.groupId;
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
    return this.#state.recurrence?.value.startDate?.value;
  }
  get endDate() {
    return this.#state.endDate?.value;
  }
  get deadline() {
    return this.#state.recurrence?.value.deadline?.value;
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
