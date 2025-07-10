import { ThingEntity } from '@/modules/things/domain';
import { DomainValidator, Name, Result } from '@big-d/api-utils';
import { AggregateRoot } from '@nestjs/cqrs';
import { CalculateResult } from '@shared/domain';
import { randomInt } from 'node:crypto';

const validator = new DomainValidator('groups');

interface GroupData {
  readonly id: number;
  readonly userId: number;
  readonly goalId?: number;
  position: number;
  name: Name;
  description?: string;
  result: Result;
  isDraft: boolean;
  things: ThingEntity[];
}

interface CreateGroupData {
  readonly userId: number;
  readonly goalId?: number;
  readonly name: Name;
  readonly description?: string;
  position: number;
}

class GroupEntity extends AggregateRoot {
  #data: GroupData;
  protected constructor(init: GroupData) {
    super();
    this.#data = init;
  }

  static create(data: CreateGroupData) {
    return new GroupEntity({
      id: randomInt(0, Date.now()),
      result: Result.create(0),
      things: [],
      isDraft: true,
      ...data,
    }).validate();
  }

  static restore(data: Omit<GroupData, 'things' | 'isDraft'>) {
    return new GroupEntity({
      ...data,
      isDraft: false,
      things: [],
    });
  }

  public setName(value: Name) {
    this.#data.name = value;
    return this;
  }

  public setPosition(value: number) {
    this.#data.position = value;
    return this;
  }

  public setDescription(value?: string) {
    this.#data.description = value;
    return this;
  }

  public setThings(value: ThingEntity[]) {
    this.#data.things = value;
    return this;
  }

  public createClone() {
    return new GroupEntity({ ...this.#data });
  }

  public validate() {
    if (this.#data.things.some((i) => i.groupId !== this.id)) {
      validator.throwError(`All Things must belong to group {id: ${this.id}}`, 'things');
    }

    if (new Set(this.#data.things.map((item) => item.position)).size !== this.#data.things.length) {
      validator.throwError(`Things must not have position duplicates`, 'things');
    }

    for (const thing of this.#data.things) {
      thing.validate();
    }

    return this;
  }

  get id() {
    return this.#data.id;
  }
  get userId() {
    return this.#data.userId;
  }
  get goalId() {
    return this.#data.goalId;
  }
  get name() {
    return this.#data.name.value;
  }
  get description() {
    return this.#data.description;
  }
  get position() {
    return this.#data.position;
  }
  get result() {
    if (!this.#data.isDraft) return this.#data.result.value;

    const totalParts = this.#data.things.length;
    if (totalParts === 0) return 0;

    return CalculateResult.execute(this.#data.things);
  }
  get things() {
    return [...this.#data.things];
  }

  get isPredefined(): boolean {
    return this.#data.goalId == null;
  }

  get isDraft(): boolean {
    return this.#data.isDraft;
  }

  get isFinalized(): boolean {
    return this.#data.things.length > 0 && this.#data.things.every((thing) => thing.isFinalized);
  }
}

export { GroupEntity };
