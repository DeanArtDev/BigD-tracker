import type { ApiDto } from '@/shared/api/types';

type Step = 'repetition' | 'break' | 'finish' | 'start';

interface IActiveTrainingController {
  currentStep: Step;
  exercises: ActiveExercise[];
  activeExercise: ActiveExercise | undefined;
  activeTraining: ApiDto['TrainingWithExercisesDto'];
  repetitions: ActiveRepetition[];

  canFinishRepetition(totalSeconds: number): boolean;
  setRepetitionDuration(id: number, seconds: number): void;
  setRepetitionFact(data: {
    id: number;
    finishType: ApiDto['RepetitionDto']['finishType'] & string;
    factCount: number;
    factWeight: number;
  }): void;
}

interface EntityStatus {
  stage: 'active' | 'done' | 'inactive';
}

type ActiveRepetition = { stage: EntityStatus['stage'] | 'break' } & {
  readonly id: number;
  readonly exerciseId: number;
  readonly targetCount: number;
  readonly targetWeight: number;
  readonly targetBreak: number;
  readonly finishType?: ApiDto['RepetitionDto']['finishType'];
  readonly factCount?: number;
  readonly factWeight?: number;
};

interface ActiveExercise extends EntityStatus {
  readonly id: number;
  readonly name: string;
  readonly type: ApiDto['ExerciseWithRepetitionsDto']['type'];
  readonly exampleUrl?: string;
  readonly description?: string;
}

class ActiveTrainingController implements IActiveTrainingController {
  #activeRepetition: ActiveRepetition | undefined = undefined;
  #currentStep: Step = 'start';
  #minSpendExerciseSeconds = 10;
  #repetitions: ActiveRepetition[] = [];
  #exercises: ActiveExercise[] = [];
  #training: ApiDto['TrainingWithExercisesDto'];

  constructor(training: ApiDto['TrainingWithExercisesDto']) {
    this.#training = Object.assign({}, training);
    this.#recalculate();
  }

  public start() {
    this.#training.inProgress = true;
    this.#goToRepetition();
  }

  #goToRepetition(): void {
    this.#currentStep = 'repetition';
  }

  #goToBreak(): void {
    this.#currentStep = 'break';
  }

  #goToFinish(): void {
    this.#currentStep = 'finish';
  }

  public setRepetitionFact(data: {
    id: number;
    finishType: ApiDto['RepetitionDto']['finishType'] & string;
    factCount: number;
    factWeight: number;
  }): void {
    const activeRepetition = this.#findPureRepetition(data.id);
    if (activeRepetition != null) {
      activeRepetition.factWeight = data.factWeight.toString();
      activeRepetition.factCount = data.factCount;
      activeRepetition.finishType = data.finishType;
    }
    this.#recalculate();
  }

  public setRepetitionDuration(id: number, factBreakSeconds: number): void {
    const activeRepetition = this.#findPureRepetition(id);
    if (activeRepetition == null) return;

    activeRepetition.factBreak = factBreakSeconds > 15 ? 15 : factBreakSeconds;
    this.#recalculate();
  }

  public canFinishRepetition = (totalSeconds: number): boolean => {
    return totalSeconds >= this.#minSpendExerciseSeconds;
  };

  get exercises(): ActiveExercise[] {
    return [...this.#exercises];
  }

  get activeRepetition(): ActiveRepetition | undefined {
    return this.#activeRepetition;
  }

  get activeExercise(): ActiveExercise | undefined {
    return this.#exercises.find((exercise) => exercise.stage === 'active');
  }

  get activeTraining(): ApiDto['TrainingWithExercisesDto'] {
    return Object.assign({}, this.#training);
  }

  get repetitions(): ActiveRepetition[] {
    if (this.#repetitions.some((rep) => rep.exerciseId !== this.activeExercise?.id)) {
      return [];
    }
    return [...this.#repetitions];
  }

  get currentStep(): Step {
    return this.#currentStep;
  }

  #recalculate() {
    this.#repetitions = [];

    this.#activeRepetition = undefined;
    const buffer: [ActiveExercise, ActiveRepetition[]][] = [];

    for (let i = 0; i < this.#training.exercises.length; i++) {
      const exercise = this.#training.exercises[i];

      const repetitions = this.#calculateRepetitions(exercise.repetitions);

      const isDone = repetitions.every((rep) => rep.stage === 'done');
      const isActive = repetitions.some((rep) =>
        this.#activeRepetitionStatuses.includes(rep.stage),
      );
      const stage = isDone ? 'done' : isActive ? 'active' : 'inactive';

      buffer.push([
        {
          stage,
          id: exercise.id,
          name: exercise.name,
          type: exercise.type,
          exampleUrl: exercise.exampleUrl,
          description: exercise.description,
        },
        repetitions,
      ]);
    }

    for (const [exercise, repetitions] of buffer) {
      if (exercise.stage === 'active') {
        this.#repetitions = repetitions;
        break;
      }
    }
    this.#exercises = buffer.map(([exercise]) => exercise);

    if (this.#training.inProgress) {
      this.#calculateStep();
    }
  }

  #calculateStep() {
    if (this.activeRepetition == null && this.activeExercise == null) {
      this.#goToFinish();
    } else if (this.activeRepetition?.stage === 'break') {
      this.#goToBreak();
    } else if (this.activeRepetition?.stage === 'active') {
      this.#goToRepetition();
    }
  }

  #calculateRepetitions(repetitions: ApiDto['RepetitionDto'][]): ActiveRepetition[] {
    const repetitionsBuffer: ActiveRepetition[] = [];

    for (let j = 0; j < repetitions.length; j++) {
      const rep = repetitions[j];
      const repData = {
        ...rep,
        targetWeight: +rep.targetWeight,
        factWeight: rep.factWeight == null ? undefined : +rep.factWeight,
      };

      let result: ActiveRepetition | null = null;
      const { isDone, isActive, isBreak } = this.#computeRepStage(rep);

      if (isActive) {
        result = { stage: 'active', ...repData };
      } else if (isBreak) {
        result = { stage: 'break', ...repData };
      } else if (isDone) {
        result = { stage: 'done', ...repData };
      } else {
        result = { stage: 'inactive', ...repData };
      }

      if (this.#activeRepetition == null && this.#activeRepetitionStatuses.includes(result.stage)) {
        this.#activeRepetition = result;
      }

      repetitionsBuffer.push(result);
    }

    return repetitionsBuffer;
  }

  #findPureRepetition(id: number): ApiDto['RepetitionDto'] | undefined {
    for (const exercise of this.#training.exercises) {
      for (const repetition of exercise.repetitions) {
        if (repetition.id === id) {
          return repetition;
        }
      }
    }
    return undefined;
  }

  get #activeRepetitionStatuses() {
    return ['active', 'break'];
  }

  #computeRepStage(rep: ApiDto['RepetitionDto']) {
    const isDone = [rep.finishType, rep.factCount, rep.factWeight, rep.factBreak].every(
      (i) => i != null,
    );

    const isActive =
      [rep.finishType, rep.factCount, rep.factWeight, rep.factBreak].every((i) => i == null) &&
      this.#activeRepetition == null;

    const isBreak =
      rep.factBreak == null &&
      [rep.factCount, rep.factWeight, rep.finishType].every((i) => i != null);

    return {
      isDone,
      isActive,
      isBreak,
    };
  }
}

export { ActiveTrainingController, type ActiveRepetition, type ActiveExercise };
