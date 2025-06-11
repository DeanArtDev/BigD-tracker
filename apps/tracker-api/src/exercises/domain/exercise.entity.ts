import { Validator } from '@shared/lib/validator';
import { ExerciseType } from '../application/exercises.repository';

const validator = new Validator('exercises');

interface ExerciseData {
  readonly id: number;
  userId?: number;
  trainingId?: number;
  trainingTemplateId?: number;
  name: string;
  type: ExerciseType;
  description?: string;
  exampleUrl?: string;
}

interface CreateData {
  userId?: number;
  trainingId?: number;
  trainingTemplateId?: number;
  name: string;
  type: ExerciseType;
  description?: string;
  exampleUrl?: string;
}

class ExerciseEntity {
  static create(data: CreateData) {
    const { userId, description, name, type, exampleUrl, trainingTemplateId, trainingId } = data;

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

    validator.isNotStringEmpty(name, 'name');
    validator.isEnum(type, ExerciseType, 'type');

    return new ExerciseEntity({
      id: Infinity,
      type: data.type,
      name: data.name,
      description: data.description,
      exampleUrl: data.exampleUrl,
      userId: data.userId,
    });
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
    });
  }

  protected constructor(protected readonly data: ExerciseData) {}

  update(data: {
    name: string;
    type: ExerciseType;
    description?: string;
    exampleUrl?: string;
  }): this {
    const { description, name, type, exampleUrl } = data;

    if (exampleUrl != null) {
      validator.isUrl(exampleUrl, 'exampleUrl');
    }

    if (description != null) {
      validator.isNotStringEmpty(description, 'description');
    }

    validator.isNotStringEmpty(name, 'name');
    validator.isEnum(type, ExerciseType, 'type');

    this.data.name = name;
    this.data.type = type;
    this.data.description = description;
    this.data.exampleUrl = exampleUrl;

    return this;
  }

  assignToTraining(input: { trainingId: number }) {
    if (this.data.trainingId != null) {
      validator.throwError(
        `You can not assign exercise: ${this.data.id} to another training: ${input.trainingId}
         if it has already assigned to training: ${this.data.trainingId}`,
        'trainingTemplateId',
      );
    }
    validator.isIdValId(input.trainingId, 'trainingId');
    this.data.trainingId = input.trainingId;
  }

  assignToTemplate(input: { trainingTemplateId: number }) {
    if (this.data.trainingId != null) {
      validator.throwError(
        `You can not assign exercise: ${this.data.id} to template: ${input.trainingTemplateId} if it has already assigned to training`,
        'trainingTemplateId',
      );
    }
    validator.isIdValId(input.trainingTemplateId, 'trainingTemplateId');
    this.data.trainingTemplateId = input.trainingTemplateId;
  }

  get isDraft() {
    return this.data.userId === Infinity || this.data.id === Infinity;
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
}

export { ExerciseEntity, ExerciseType, ExerciseData };
