import { CreateRepetitionsService, RepetitionEntity } from '@/repetitions';
import { Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import { ExerciseWithRepetitionsEntity } from '../../../../domain/exercise-with-repetitions.entity';
import { ExerciseWithRepetitionsDto } from '../../../dtos/exercise-with-repetitions.dto';
import { EXERCISE_REPOSITORY, ExercisesRepository } from '../../../exercises.repository';
import { ExercisesWithRepetitionsMapper } from '../../../mappers/exercises-with-repetitions.mapper';
import { CreateExerciseWithRepetitionsData } from './create-exercises-with-repetitions.dto';

@Injectable()
export class CreateExercisesWithRepetitionsCommand {
  constructor(
    @Inject(EXERCISE_REPOSITORY)
    private readonly exercisesRepo: ExercisesRepository,

    private readonly exercisesWithRepetitionsMapper: ExercisesWithRepetitionsMapper,

    private readonly createRepetitionsService: CreateRepetitionsService,
  ) {}

  async execute(
    dto: CreateExerciseWithRepetitionsData,
    userId: number,
  ): Promise<ExerciseWithRepetitionsDto> {
    const exerciseDraft = ExerciseWithRepetitionsEntity.create({
      userId,
      type: dto.type,
      name: dto.name,
      repetitions: dto.repetitions.map(RepetitionEntity.create),
      exampleUrl: dto.exampleUrl,
      description: dto.description,
    });

    const exercise = await this.exercisesRepo.create({
      user_id: exerciseDraft.userId,
      type: exerciseDraft.type,
      name: exerciseDraft.name,
      description: exerciseDraft.description,
      example_url: exerciseDraft.exampleUrl,
    });
    if (exercise == null) {
      throw new InternalServerErrorException('Failed to create exercise');
    }

    const repetitions = await this.createRepetitionsService.execute(
      exerciseDraft.repetitions.map((repetition) => {
        return {
          targetWeight: repetition.targetWeight,
          targetCount: repetition.targetCount,
          targetBreak: repetition.targetBreak,
          exerciseId: exercise.id,
        };
      }),
      userId,
    );

    return this.exercisesWithRepetitionsMapper.fromEntityToDTO(
      ExerciseWithRepetitionsEntity.restore({
        id: exercise.id,
        type: exercise.type,
        name: exercise.name,
        userId: exercise.userId,
        description: exercise.description,
        exampleUrl: exercise.exampleUrl,
        repetitions,
      }),
    );
  }
}
