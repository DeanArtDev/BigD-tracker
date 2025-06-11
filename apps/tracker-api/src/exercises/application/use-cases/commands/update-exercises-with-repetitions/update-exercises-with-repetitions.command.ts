import { RepetitionEntity, UpdateRepetitionsService } from '@/repetitions';
import { Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import { ExerciseWithRepetitionsEntity } from '../../../../domain/exercise-with-repetitions.entity';
import { ExerciseWithRepetitionsDto } from '../../../dtos/exercise-with-repetitions.dto';
import {
  EXERCISE_REPOSITORY,
  ExercisesRepository,
  ExerciseType,
} from '../../../exercises.repository';
import { ExercisesWithRepetitionsMapper } from '../../../mappers/exercises-with-repetitions.mapper';
import { GetExercisesWithRepetitionsQuery } from '../../queries/get-exercises-with-repetitions.query';

interface UpdateExerciseWithRepetitionsInput {
  readonly id: number;
  readonly userId: number;
  readonly name: string;
  readonly type: ExerciseType;
  readonly description?: string;
  readonly exampleUrl?: string;
  readonly repetitions: {
    readonly targetCount: number;
    readonly targetWeight: string;
    readonly targetBreak: number;
  }[];
}

@Injectable()
export class UpdateExercisesWithRepetitionsCommand {
  constructor(
    @Inject(EXERCISE_REPOSITORY)
    private readonly exercisesRepo: ExercisesRepository,

    private readonly getExercisesWithRepetitions: GetExercisesWithRepetitionsQuery,
    private readonly exercisesWithRepetitionsMapper: ExercisesWithRepetitionsMapper,

    private readonly updateRepetitionsService: UpdateRepetitionsService,
  ) {}

  async execute(input: UpdateExerciseWithRepetitionsInput): Promise<ExerciseWithRepetitionsDto> {
    const { userId, type, name, repetitions, id, exampleUrl, description } = input;

    const currentExercise = await this.getExercisesWithRepetitions.one({ id, userId });

    const updatedDraftedExercise = currentExercise
      .update({
        name,
        type,
        exampleUrl,
        description,
      })
      .replaceRepetitions(
        repetitions.map((r) => {
          return RepetitionEntity.create({ ...r, exerciseId: currentExercise.id });
        }),
      );

    const updatedExercise = await this.exercisesRepo.update(
      {
        name: updatedDraftedExercise.name,
        type: updatedDraftedExercise.type,
        description: updatedDraftedExercise.description,
        id: updatedDraftedExercise.id,
        user_id: updatedDraftedExercise.userId,
        example_url: updatedDraftedExercise.exampleUrl,
      },
      { replace: true },
    );

    if (updatedExercise == null) {
      throw new InternalServerErrorException(`Failed to update exercise {id: ${id}}`);
    }

    const createdRepetitions = await this.updateRepetitionsService.execute({
      userId,
      exerciseId: id,
      repetitions,
    });
    console.log(createdRepetitions);
    return this.exercisesWithRepetitionsMapper.fromEntityToDTO(
      ExerciseWithRepetitionsEntity.restore({
        id,
        repetitions: createdRepetitions,
        exampleUrl: updatedExercise.exampleUrl,
        userId: updatedExercise.userId,
        description: updatedExercise.description,
        type: updatedExercise.type,
        name: updatedExercise.name,
      }),
    );
  }
}
