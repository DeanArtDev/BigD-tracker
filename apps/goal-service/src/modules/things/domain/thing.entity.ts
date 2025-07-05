import { DomainValidator } from '@big-d/api-utils';
import { AggregateRoot } from '@nestjs/cqrs';
import { randomInt } from 'crypto';

const validator = new DomainValidator('things');

interface ThingData {
  readonly id: number;
}

interface CreateThingData {
  readonly id: number;
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
    }).validate();
  }

  static restore(data: ThingData) {
    return new ThingEntity({
      id: data.id,
    });
  }

  public validate() {
    return this;
  }

  get id() {
    return this.#data.id;
  }
}

export { ThingEntity, ThingData };
