import { TaskStatus } from '@big-d/api-contracts';
import { AggregateRoot } from '@nestjs/cqrs';
import { assertHasCancelReason, assertThingDates } from './tasks.invariants';
import { TaskCreateInput, TaskRestoreInput, TaskState } from './tasks.types';

class Task extends AggregateRoot {
  #state: TaskState;

  private constructor(input: Readonly<TaskState>) {
    super();

    this.#state = input;
  }

  static create(input: TaskCreateInput): Task {
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
    }).#validate();
  }

  toJSON(): string {
    return JSON.stringify(this.#state, null, 2);
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

  #validate(): this {
    const { startDate, endDate, deadline, cancelReason, status } = this.#state;
    assertThingDates({ end: endDate, start: startDate, deadline });
    assertHasCancelReason({ status, reason: cancelReason });
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

export { Task, TaskCreateInput };
