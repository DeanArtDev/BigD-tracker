import { TaskStatus } from '@big-d/api-contracts';
import { AggregateRoot } from '@nestjs/cqrs';
import { assertTaskDates, assertTaskDelete, assertTaskUpdate } from './tasks.invariants';
import { TaskCreateInput, TaskRestoreInput, TaskState, TaskUpdateInput } from './tasks.types';

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
    const { startDate, endDate, deadline } = this.#state;
    assertTaskDates({ end: endDate, start: startDate, deadline });
    return this;
  }

  public update(input: TaskUpdateInput): this {
    assertTaskUpdate({ status: this.#state.status, endDate: this.#state.endDate?.value });

    this.#state.name = input.name;
    this.#state.description = input.description;
    this.#state.priority = input.priority;
    this.#state.weight = input.weight;
    this.#state.startDate = input.startDate;
    this.#state.deadline = input.deadline;
    this.#state.recurrence = input.recurrence;

    return this.#validate();
  }

  public delete(): this {
    assertTaskDelete({ status: this.#state.status });
    this.#state.status = TaskStatus.DELETED;

    return this.#validate();
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
