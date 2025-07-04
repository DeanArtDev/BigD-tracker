import { RepetitionEntity } from '@modules/repetitions';
import { DomainValidator } from '@big-d/api-utils';

import { ExerciseData, ExerciseEntity } from './exercise.entity';

const validator = new DomainValidator('exercises-with-repetitions');

interface ExerciseWithRepetitionsData extends ExerciseData {
  repetitions: RepetitionEntity[];
}

type UpdateExerciseRepetitionsInput = {
  id?: number;
  targetCount: number;
  targetWeight: string;
  targetBreak: number;
  description?: string;
}[];

class ExerciseWithRepetitionsEntity extends ExerciseEntity {
  static create = (
    data: Parameters<typeof ExerciseEntity.create>[0],
  ): ExerciseWithRepetitionsEntity => {
    const exercise = ExerciseEntity.create(data);
    return new ExerciseWithRepetitionsEntity({
      id: exercise.id,
      type: exercise.type,
      name: exercise.name,
      description: exercise.description,
      exampleUrl: exercise.exampleUrl,
      userId: exercise.userId,
      trainingId: exercise.trainingId,
      trainingTemplateId: exercise.trainingTemplateId,
      position: exercise.position,
      repetitions: [],
    }).validate();
  };

  static restore = (
    data: Omit<ExerciseWithRepetitionsData, 'repetitions'>,
  ): ExerciseWithRepetitionsEntity => {
    const exercise = ExerciseEntity.restore(data);
    return new ExerciseWithRepetitionsEntity({
      id: exercise.id,
      type: exercise.type,
      name: exercise.name,
      description: exercise.description,
      exampleUrl: exercise.exampleUrl,
      userId: exercise.userId,
      trainingId: exercise.trainingId,
      trainingTemplateId: exercise.trainingTemplateId,
      position: exercise.position,
      repetitions: [],
    });
  };

  private constructor(protected readonly data: ExerciseWithRepetitionsData) {
    super(data);
  }

  public setRepetitions(repetitions: RepetitionEntity[]): this {
    this.data.repetitions = repetitions;
    validator.isIntGt(this.repetitions.length, 1, 'repetitions');
    this.validate();
    return this;
  }

  public updateRepetitions(input: UpdateExerciseRepetitionsInput): this {
    const indexMap = new Map<number, RepetitionEntity>();
    for (const repetition of this.data.repetitions) {
      indexMap.set(repetition.id, repetition);
    }

    const buffer: RepetitionEntity[] = [];

    for (let index = 0; index < input.length; index++) {
      const rep = input[index];

      if (rep.id == null) {
        buffer.push(
          RepetitionEntity.create({
            position: index,
            exerciseId: this.id,
            userId: this.userId,
            description: rep.description,
            targetBreak: rep.targetBreak,
            targetWeight: rep.targetWeight,
            targetCount: rep.targetCount,
          }),
        );
        continue;
      }

      const prevRep = indexMap.get(rep.id);
      if (prevRep != null) {
        buffer.push(
          prevRep
            .updateTargets({
              targetCount: rep.targetCount,
              targetWeight: rep.targetWeight,
              targetBreak: rep.targetBreak,
            })
            .updateDescription(rep.description)
            .updatePosition(index),
        );
      }
    }

    this.setRepetitions(buffer);
    return this;
  }

  public canStart(trainingId: number): boolean {
    if (!super.canStart(trainingId)) return false;

    for (const repetition of this.data.repetitions) {
      if (!repetition.canStart(this.data.id)) return false;
    }

    return true;
  }

  public canFinish(trainingId: number): boolean {
    if (!super.canFinish(trainingId)) return false;

    for (const repetition of this.data.repetitions) {
      if (!repetition.canFinish(this.data.id)) return false;
    }

    return true;
  }

  public canUpdateRepetitionBreak(repetitionId: number): boolean {
    for (const repetition of this.data.repetitions) {
      if (repetition.id === repetitionId) {
        return repetition.canSetBreak();
      }
    }

    return false;
  }

  public validate() {
    super.validate();

    const LIMIT = 20;
    if (this.data.repetitions.length > LIMIT) {
      validator.throwError(
        `There are to much repetitions for exercise {id: ${this.id}} limit is ${LIMIT}`,
        'repetitions',
      );
    }

    if (this.data.repetitions.some((i) => i.exerciseId !== this.id)) {
      validator.throwError(`Repetitions must belong to exercise {id: ${this.id}}`, 'repetitions');
    }

    if (
      new Set(this.data.repetitions.map((item) => item.position)).size !==
      this.data.repetitions.length
    ) {
      validator.throwError(`Repetitions must not have position duplicates`, 'repetitions');
    }

    for (const repetition of this.data.repetitions) {
      repetition.validate();
    }

    return this;
  }

  get repetitions() {
    return [...this.data.repetitions];
  }
}

export { ExerciseWithRepetitionsEntity, UpdateExerciseRepetitionsInput };
