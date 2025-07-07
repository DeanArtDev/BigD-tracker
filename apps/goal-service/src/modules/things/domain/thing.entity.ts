import { Priority } from './vo/priority';
import { Result } from './vo/result';
import { WeekDays } from './vo/week-days';
import { DomainValidator } from '@big-d/api-utils';
import { DateVo, Name } from '@big-d/api-utils';
import { AggregateRoot } from '@nestjs/cqrs';
import { randomInt } from 'node:crypto';

const validator = new DomainValidator('things');

interface ThingData {
  readonly id: number;
  readonly userId: number;
  groupId: number;
  name: Name;
  description?: string;
  priority?: Priority;
  startDate?: DateVo;
  endDate?: DateVo;
  deadline?: DateVo;
  weekDays?: WeekDays;
  result?: Result;
  comment?: string;
}

interface CreateThingData {
  readonly groupId: number;
  readonly userId: number;
  readonly name: Name;
  readonly description?: string;
  readonly priority?: Priority;
  readonly startDate?: DateVo;
  readonly deadline?: DateVo;
}

interface CreateRepeatableThingData {
  readonly groupId: number;
  readonly userId: number;
  readonly name: Name;
  readonly description?: string;
  readonly priority?: Priority;
  readonly weekDays: WeekDays;
}

class ThingEntity extends AggregateRoot {
  #data: ThingData;
  protected constructor(init: ThingData) {
    super();
    this.#data = init;
  }

  static create(data: CreateThingData) {
    return new ThingEntity({
      id: randomInt(0, Date.now()),
      ...data,
    }).validate();
  }

  static createRepeatable(data: CreateRepeatableThingData) {
    return new ThingEntity({
      id: randomInt(0, Date.now()),
      ...data,
    }).validate();
  }

  static restore(data: ThingData) {
    return new ThingEntity(data);
  }

  public changeStartDate(value: DateVo) {
    this.#data.startDate = value;
    return this;
  }

  public changeDeadline(value: DateVo) {
    this.#data.deadline = value;
    return this;
  }

  public changeResult(value: Result) {
    this.#data.result = value;
    return this;
  }

  public changeName(value: Name) {
    this.#data.name = value;
    return this;
  }

  public changeGroup(value: number) {
    this.#data.groupId = value;
    return this;
  }

  public changePriority(value: Priority) {
    this.#data.priority = value;
    return this;
  }

  public changeDescription(value: string) {
    this.#data.description = value;
    return this;
  }

  public changeWeekDays(value: WeekDays) {
    this.#data.weekDays = value;
    return this;
  }

  public finish(input: { endDate: DateVo; comment?: string; result: Result }) {
    this.#data.endDate = input.endDate;
    this.#data.result = input.result;
    this.#data.comment = input.comment;
    return this;
  }

  public validate() {
    const { startDate, endDate, deadline, weekDays } = this.#data;

    if (startDate != null && endDate != null) {
      if (startDate.isAfter(endDate.value)) {
        validator.throwError(
          `startDate:${startDate.value} must not be after endDate: ${endDate.value}`,
          'startDate',
        );
      }
    }

    if (startDate != null && deadline != null) {
      if (startDate.isAfter(deadline.value)) {
        validator.throwError(
          `startDate:${startDate.value} must not be after deadline: ${deadline.value}`,
          'startDate',
        );
      }
    }

    if (endDate != null && deadline != null) {
      if (endDate.isAfter(deadline.value)) {
        validator.throwError(
          `endDate:${endDate.value} must not be after deadline: ${deadline.value}`,
          'endDate',
        );
      }
    }

    if (weekDays != null && [startDate, endDate, deadline].some((i) => i != null)) {
      validator.throwError(
        `Repeatable thing cannot have fields [startDate, endDate, deadline]`,
        'startDate',
      );
    }

    return this;
  }

  get id() {
    return this.#data.id;
  }
  get groupId() {
    return this.#data.groupId;
  }
  get userId() {
    return this.#data.userId;
  }
  get name() {
    return this.#data.name.value;
  }
  get description() {
    return this.#data.description;
  }
  get priority() {
    return this.#data.priority?.value;
  }
  get startDate() {
    return this.#data.startDate?.value;
  }
  get endDate() {
    return this.#data.endDate?.value;
  }
  get deadline() {
    return this.#data.deadline?.value;
  }
  get weekDays() {
    return this.#data.weekDays?.value;
  }
  get result() {
    return this.#data.result?.value;
  }
  get comment() {
    return this.#data.comment;
  }
  get isRepeatable() {
    return this.#data.weekDays != null;
  }
}

export { ThingEntity, ThingData };
