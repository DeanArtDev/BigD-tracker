import { RecurrenceFrequency, TaskStatus } from '@big-d/api-contracts';
import { DateVo } from '@big-d/api-utils';
import { AggregateRoot } from '@nestjs/cqrs';
import { ExceptionTaskDomainInvalidInvariant } from '../../exceptions';
import {
  allowedTaskStatusByAction,
  allowTaskStatusTransitions,
  TaskStatusActions,
} from '../../specifications';
import { taskAsserts } from './tasks.invariants';
import {
  TaskCreateInput,
  TaskRecurrence,
  TaskReplaceInput,
  TaskRestoreInput,
  TaskState,
} from './tasks.types';
import { Priority, Weight } from './value-objects';

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
      startDate: input.startDate,
      deadline: input.deadline,
      endDate: input.endDate,
      status: input.status,
      recurrence: input.recurrence,
    });
  }

  static create(input: TaskCreateInput): Task {
    const startDate = input.startDate;
    const deadline = input.deadline;

    return new Task({
      id: NaN,
      userId: input.userId,
      name: input.name,
      description: input.description,
      priority: input.priority,
      weight: input.weight,
      startDate,
      deadline,
      status: Task.calculateStatusByDates({ startDate, deadline }),
      recurrence: input.recurrence,
    });
  }

  public replace(input: TaskReplaceInput): this {
    const { recurrence } = input;
    const startDate = input.startDate;
    const deadline = input.deadline;

    if (this.#isAllowTo('REPLACE_EVERYTHING')) {
      if (recurrence != null) {
        taskAsserts.neededRecurrenceFields({
          start: recurrence?.value?.start,
          deadline: recurrence?.value?.end,
        });
      }

      this.#state.status = Task.calculateStatusByDates({ startDate, deadline });
      this.#state.name = input.name;
      this.#state.description = input.description;
      this.#state.priority = input.priority;
      this.#state.weight = input.weight;
      this.#state.startDate = startDate;
      this.#state.deadline = deadline;
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
      this.#state.startDate = undefined;
      this.#state.deadline = undefined;
      this.#state.recurrence = undefined;
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
        const { deadline, startDate } = this.#state;

        this.#state.endDate = undefined;
        this.#state.startDate = undefined;
        this.#state.deadline = undefined;

        this.#setStatus(
          Task.calculateStatusByDates({
            startDate,
            deadline,
            endDate: this.#state.endDate,
          }),
        );
      }

      this.#state.recurrence = undefined;
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
      const startDate = this.#state.startDate;
      const deadline = this.#state.deadline;

      this.#state.endDate = DateVo.create(new Date());
      taskAsserts.datesIntersections({ start: startDate, end: this.#state.endDate });

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
  get recurrence(): TaskRecurrence | undefined {
    if (this.#state.recurrence?.value.start?.value == null) return undefined;
    return {
      weekdays: this.#state.recurrence?.value.weekdays,
      frequency: this.#state.recurrence?.value.frequency,
      start: this.#state.recurrence?.value.start.value,
      end: this.#state.recurrence?.value.end?.value,
    };
  }
  get isDraft(): boolean {
    return Number.isNaN(this.#state.id);
  }

  isRecurrence(): this is this & {
    recurrence: {
      start: string;
      frequency: RecurrenceFrequency;
    };
  } {
    return [this.recurrence?.frequency, this.recurrence?.start].every((i) => i != null);
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
