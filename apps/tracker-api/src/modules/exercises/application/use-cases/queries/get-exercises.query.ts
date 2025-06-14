import { ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ExerciseEntity } from '../../../domain/exercise.entity';
import { EXERCISE_REPOSITORY, ExercisesRepository } from '../../repositories/exercises.repository';

@Injectable()
export class GetExercisesQuery {
  constructor(
    @Inject(EXERCISE_REPOSITORY)
    private readonly exercisesRepo: ExercisesRepository,
  ) {}

  async all(filters: { userId: number; my?: boolean }): Promise<ExerciseEntity[]> {
    return await this.exercisesRepo.findTemplatable({
      userId: filters.userId,
      onlyUser: filters.my,
    });
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
