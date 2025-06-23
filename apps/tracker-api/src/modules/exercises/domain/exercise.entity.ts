import { Validator } from '@shared/lib/validator';
import { randomInt } from 'crypto';
import { ExerciseType } from '../application/repositories/exercises.repository';

const validator = new Validator('exercises');

interface ExerciseData {
  readonly id: number;
  position: number;
  userId?: number;
  trainingId?: number;
  trainingTemplateId?: number;
  name: string;
  type: ExerciseType;
  description?: string;
  exampleUrl?: string;
}

interface CreateData {
  readonly userId?: number;
  readonly name: string;
  readonly type: ExerciseType;
  readonly description?: string;
  readonly exampleUrl?: string;
  readonly position: number;
}

interface UpdateData {
  readonly name: string;
  readonly type: ExerciseType;
  readonly description?: string;
  readonly exampleUrl?: string;
  readonly position: number;
}

class ExerciseEntity {
  static create(data: CreateData) {
    return new ExerciseEntity({
      id: randomInt(0, Date.now()),
      type: data.type,
      name: data.name,
      description: data.description,
      exampleUrl: data.exampleUrl,
      userId: data.userId,
      position: data.position,
    }).validate();
  }

  static restore(data: ExerciseData) {
    return new ExerciseEntity({
      id: data.id,
      type: data.type,
      name: data.name,
      description: data.description,
      exampleUrl: data.exampleUrl,
      userId: data.userId,
      trainingId: data.trainingId,
      trainingTemplateId: data.trainingTemplateId,
      position: data.position,
    });
  }

  protected constructor(protected readonly data: ExerciseData) {
    this.validate();
  }

  public canStart(trainingId: number): boolean {
    if (this.data.trainingId == null || this.data.trainingId !== trainingId) {
      validator.throwError(
        `Exercise ${this.data.id} can't be started without any relation to a training`,
        'canStart',
      );
    }

    return true;
  }

  public canFinish(trainingId: number): boolean {
    if (this.data.trainingId == null || this.data.trainingId !== trainingId) {
      validator.throwError(
        `Exercise ${this.data.id} can't be finished without any relation to a training`,
        'canFinish',
      );
    }

    return true;
  }

  public validate() {
    const {
      id,
      name,
      type,
      exampleUrl,
      position,
      trainingTemplateId,
      trainingId,
      userId,
      description,
    } = this.data;

    validator.isValidInt(position, 'position');

    validator.isNotStringEmpty(name, 'name');
    validator.isEnum(type, ExerciseType, 'type');

    if (exampleUrl != null) {
      validator.isUrl(exampleUrl, 'exampleUrl');
    }

    if (description != null) {
      validator.isNotStringEmpty(description, 'description');
    }

    if (userId != null) {
      validator.isIdValId(userId, 'userId');
    }

    if (trainingTemplateId != null) {
      validator.isIdValId(trainingTemplateId, 'trainingTemplateId');
    }

    if (trainingId != null) {
      validator.isIdValId(trainingId, 'trainingId');
    }

    validator.isIdValId(id, 'id');
    validator.isNotStringEmpty(name, 'name');
    validator.isEnum(type, ExerciseType, 'type');

    return this;
  }

  update(data: UpdateData): this {
    const { description, name, position, type, exampleUrl } = data;

    this.data.position = position;
    this.data.name = name;
    this.data.type = type;
    this.data.description = description;
    this.data.exampleUrl = exampleUrl;

    this.validate();
    return this;
  }

  assignToTraining(input: { trainingId: number }): this {
    if (this.data.trainingTemplateId != null) {
      validator.throwError(
        `You can assign exercise neither to training or to template training`,
        'assignToTraining',
      );
    }
    if (this.data.trainingId != null) {
      validator.throwError(
        `You can not assign exercise: ${this.data.id} to another training: ${input.trainingId}
         if it has already assigned to training: ${this.data.trainingId}`,
        'assignToTraining',
      );
    }
    this.validate();
    this.data.trainingId = input.trainingId;
    return this;
  }

  assignToTemplate(input: { trainingTemplateId: number }): this {
    if (this.data.trainingId != null) {
      validator.throwError(
        `You can not assign exercise: ${this.data.id} to another training template: ${input.trainingTemplateId}
         if it has already assigned to another one: ${this.data.trainingId}`,
        'assignToTemplate',
      );
    }
    if (this.data.trainingId != null) {
      validator.throwError(
        `You can not assign exercise: ${this.data.id} to template: ${input.trainingTemplateId} if it has already assigned to training`,
        'assignToTemplate',
      );
    }
    this.data.trainingTemplateId = input.trainingTemplateId;
    this.validate();
    return this;
  }

  get isCommon() {
    return this.userId == null;
  }
  get id() {
    return this.data.id;
  }
  get userId() {
    return this.data.userId;
  }
  get name() {
    return this.data.name;
  }
  get type() {
    return this.data.type;
  }
  get description() {
    return this.data.description;
  }
  get exampleUrl() {
    return this.data.exampleUrl;
  }
  get trainingId() {
    return this.data.trainingId;
  }
  get trainingTemplateId() {
    return this.data.trainingTemplateId;
  }
  get position() {
    return this.data.position;
  }

  get isTemplate(): boolean {
    return [this.userId, this.trainingId, this.trainingTemplateId].every((i) => i == null);
  }
}

export { ExerciseEntity, ExerciseType, ExerciseData };
