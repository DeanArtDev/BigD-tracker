import { GroupEntity } from '@/modules/groups/domain';
import { DateVo, DomainValidator, Name, Result } from '@big-d/api-utils';
import { AggregateRoot } from '@nestjs/cqrs';
import { CalculateResult } from '@shared/domain';
import { randomInt } from 'node:crypto';

const validator = new DomainValidator('goals');

interface GoalData {
  readonly id: number;
  name: Name;
  userId: number;
  isDraft: boolean;
  description?: string;
  startDate?: DateVo;
  endDate?: DateVo;
  deadline?: DateVo;
  result: Result;
  groups: GroupEntity[];
}

interface CreateGoalData {
  readonly userId: number;
  name: Name;
  description?: string;
}

class GoalEntity extends AggregateRoot {
  #data: GoalData;
  protected constructor(init: GoalData) {
    super();
    this.#data = init;
  }

  static create(data: CreateGoalData) {
    return new GoalEntity({
      id: randomInt(0, Date.now()),
      isDraft: true,
      result: Result.create(0),
      groups: [],
      ...data,
    }).validate();
  }

  static restore(data: Omit<GoalData, 'groups' | 'isDraft'>) {
    return new GoalEntity({
      isDraft: false,
      groups: [],
      ...data,
    });
  }

  public createClone() {
    return new GoalEntity({ ...this.#data });
  }

  public setName(value: Name) {
    this.#data.name = value;
    return this;
  }

  public setDescription(value?: string) {
    this.#data.description = value;
    return this;
  }

  public setGroups(value: GroupEntity[]) {
    this.#data.groups = value;
    return this;
  }

  public start(data: { startDate: DateVo; deadline: DateVo }) {
    if (this.#data.groups.length <= 0) {
      validator.throwError('Can not be started without any groups', 'start');
    }

    if (!this.#isGroupReadyToStart) {
      validator.throwError('All the groups must be ready to start', 'start');
    }

    if (this.#data.endDate != null) {
      validator.throwError('This goal has already finished', 'start');
    }

    if (this.#data.startDate != null || this.#data.deadline != null) {
      validator.throwError('This goal has already started', 'start');
    }

    this.#data.startDate = data.startDate;
    this.#data.deadline = data.deadline;
    return this;
  }

  public finish(input: { endDate: DateVo }) {
    if (!this.#isGroupReadyToFinish) {
      validator.throwError('All the groups must be ready to finish', 'finish');
    }

    if (this.#data.startDate == null || this.#data.deadline == null) {
      validator.throwError('This goal has not started yet', 'finish');
    }

    if (this.#data.endDate != null) {
      validator.throwError('This goal has already finished', 'finish');
    }

    this.#data.endDate = input.endDate;
    return this;
  }

  public validate() {
    const { endDate, deadline, startDate, groups } = this.#data;

    if (groups.some((i) => i.goalId !== this.id)) {
      validator.throwError(`All groups must belong to goal {id: ${this.id}}`, 'groups');
    }

    if (new Set(groups.map((item) => item.position)).size !== groups.length) {
      validator.throwError(`Things must not have position duplicates`, 'groups');
    }

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

    for (const group of this.#data.groups) {
      group.validate();
    }

    return this;
  }

  get id() {
    return this.#data.id;
  }

  get name() {
    return this.#data.name.value;
  }
  get userId() {
    return this.#data.userId;
  }
  get description() {
    return this.#data.description;
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
  get result() {
    const totalParts = this.#data.groups.length;
    if (totalParts === 0) return 0;

    return CalculateResult.execute(this.#data.groups);
  }

  get groups() {
    return [...this.#data.groups];
  }

  get isDraft() {
    return this.#data.isDraft;
  }

  get #isGroupReadyToStart() {
    const things = this.#data.groups.map((group) => group.things).flat(1);
    return things.length > 0 && things.every((thing) => !thing.isDraft);
  }

  get #isGroupReadyToFinish() {
    const things = this.#data.groups.map((group) => group.things).flat(1);
    return things.length > 0 && things.every((thing) => !thing.isDraft);
  }
}

export { GoalEntity };
