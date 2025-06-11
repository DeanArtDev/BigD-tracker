import { GetExercisesQuery } from '../queries/get-exercises.query';
import { Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import { EXERCISE_REPOSITORY, ExercisesRepository } from '../../exercises.repository';

@Injectable()
export class DeleteExercisesWithRepetitionsCommand {
  constructor(
    @Inject(EXERCISE_REPOSITORY)
    private readonly exercisesRepo: ExercisesRepository,
    private readonly getExercisesQuery: GetExercisesQuery,
  ) {}

  async execute(input: { id: number; userId: number }): Promise<void> {
    const exercise = await this.getExercisesQuery.one(input);

    const isDeleted = await this.exercisesRepo.delete(exercise.id);
    if (!isDeleted) {
      throw new InternalServerErrorException('Failed to create training');
    }
  }
}
