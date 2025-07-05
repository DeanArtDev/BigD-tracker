import { Injectable } from '@nestjs/common';
import { ExerciseWithRepetitionsDto } from './dtos/exercise-with-repetitions.dto';
import { ExercisesWithRepetitionsMapper } from './mappers/exercises-with-repetitions.mapper';
import {
  CreateExercisesWithRepetitionsCommand,
  CreateExerciseWithRepetitionsInput,
  GetExercisesWithRepetitionsQuery,
  UpdateExercisesWithRepetitionsCommand,
  UpdateExerciseWithRepetitionsInput,
} from './use-cases';

@Injectable()
export class ExercisesService {
  constructor(
    private readonly getExercisesWithRepetitionsQuery: GetExercisesWithRepetitionsQuery,
    private readonly exercisesWithRepetitionsMapper: ExercisesWithRepetitionsMapper,
    private readonly createExercisesWithRepetitions: CreateExercisesWithRepetitionsCommand,
    private readonly updateExercisesWithRepetitions: UpdateExercisesWithRepetitionsCommand,
  ) {}

  async getExerciseTemplates(input: {
    userId: number;
    my: boolean;
  }): Promise<ExerciseWithRepetitionsDto[]> {
    const exercises = await this.getExercisesWithRepetitionsQuery.allTemplates({
      userId: input.userId,
      onlyUser: input.my,
    });

    return exercises.map(this.exercisesWithRepetitionsMapper.fromEntityToDTO);
  }

  async getOneExercise(input: { id: number; userId: number }): Promise<ExerciseWithRepetitionsDto> {
    const exercise = await this.getExercisesWithRepetitionsQuery.one(input);

    return this.exercisesWithRepetitionsMapper.fromEntityToDTO(exercise);
  }

  async createExercise(
    input: CreateExerciseWithRepetitionsInput,
  ): Promise<ExerciseWithRepetitionsDto> {
    const exercise = await this.createExercisesWithRepetitions.execute(input);
    return this.exercisesWithRepetitionsMapper.fromEntityToDTO(exercise);
  }

  async updateExercise(
    input: UpdateExerciseWithRepetitionsInput,
  ): Promise<ExerciseWithRepetitionsDto> {
    const exercise = await this.updateExercisesWithRepetitions.execute(input);
    return this.exercisesWithRepetitionsMapper.fromEntityToDTO(exercise);
  }
}
