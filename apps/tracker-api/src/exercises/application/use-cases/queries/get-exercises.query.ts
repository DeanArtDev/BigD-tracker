import { ExerciseEntity } from '../../../domain/exercise.entity';
import { REPETITIONS_REPOSITORY, RepetitionsRepository } from '@/repetitions';
import { ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { EXERCISE_REPOSITORY, ExercisesRepository } from '../../exercises.repository';

@Injectable()
export class GetExercisesQuery {
  constructor(
    @Inject(EXERCISE_REPOSITORY)
    private readonly exercisesRepo: ExercisesRepository,

    @Inject(REPETITIONS_REPOSITORY)
    private readonly repetitionsRepo: RepetitionsRepository,
  ) {}

  async all(filters: { userId: number; my: boolean }): Promise<ExerciseEntity[]> {
    return await this.exercisesRepo.findAllByFilters(filters);
  }

  async one(input: { id: number; userId?: number }): Promise<ExerciseEntity> {
    const exercise = await this.exercisesRepo.findOneById(input.id);
    if (!exercise) {
      throw new NotFoundException(`Exercise with id ${input.id} is not found`);
    }

    if (input.userId != null && exercise.userId !== input.userId) {
      throw new ForbiddenException('This is not yours exercise with id ' + input.id);
    }

    return ExerciseEntity.restore(exercise);
  }
}
