import { Injectable } from '@nestjs/common';
import { ExerciseWithRepetitionsDto } from './dtos/exercise-with-repetitions.dto';
import { ExerciseDto } from './dtos/exercise.dto';
import { ExercisesWithRepetitionsMapper } from './mappers/exercises-with-repetitions.mapper';
import { ExercisesMapper } from './mappers/exercises.mapper';
import { GetExercisesWithRepetitionsQuery } from './use-cases/queries/get-exercises-with-repetitions.query';
import { GetExercisesQuery } from './use-cases/queries/get-exercises.query';

@Injectable()
export class ExercisesService {
  constructor(
    private readonly getExercisesQuery: GetExercisesQuery,
    private readonly exercisesMapper: ExercisesMapper,

    private readonly getExercisesWithRepetitionsQuery: GetExercisesWithRepetitionsQuery,
    private readonly exercisesWithRepetitionsMapper: ExercisesWithRepetitionsMapper,
  ) {}

  async getExercises(input: { userId: number; my: boolean }): Promise<ExerciseDto[]> {
    const exercises = await this.getExercisesQuery.all(input);

    return exercises.map(this.exercisesMapper.fromEntityToDTO);
  }

  async getExercisesWithRepetitions(input: {
    userId: number;
    my: boolean;
  }): Promise<ExerciseWithRepetitionsDto[]> {
    const exercises = await this.getExercisesWithRepetitionsQuery.all(input);

    return exercises.map(this.exercisesWithRepetitionsMapper.fromEntityToDTO);
  }

  async getOneExerciseWithRepetitions(input: {
    id: number;
    userId: number;
  }): Promise<ExerciseWithRepetitionsDto> {
    const exercise = await this.getExercisesWithRepetitionsQuery.one(input);

    return this.exercisesWithRepetitionsMapper.fromEntityToDTO(exercise);
  }
}
