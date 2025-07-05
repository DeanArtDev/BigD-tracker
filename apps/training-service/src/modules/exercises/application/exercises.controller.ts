import {
  TrainingCreateExercise,
  TrainingDeleteExercise,
  TrainingGetExerciseTemplates,
  TrainingGetOneExercise,
  TrainingUpdateExercise,
} from '@big-d/api-contracts';
import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ExercisesService } from './exercises.service';
import { DeleteExercisesWithRepetitionsCommand } from './use-cases';

@Controller()
export class ExercisesController {
  constructor(
    private readonly exercisesService: ExercisesService,
    private readonly deleteExercisesWithRepetitions: DeleteExercisesWithRepetitionsCommand,
  ) {}

  @MessagePattern(TrainingGetExerciseTemplates.pattern)
  async getExerciseTemplates(
    @Payload() { data }: TrainingGetExerciseTemplates.Request,
  ): Promise<TrainingGetExerciseTemplates.Response> {
    return {
      data: await this.exercisesService.getExerciseTemplates({
        userId: data.userId,
        my: Boolean(data.my),
      }),
    };
  }

  @MessagePattern(TrainingGetOneExercise.pattern)
  async getOneExercise(
    @Payload() { data }: TrainingGetOneExercise.Request,
  ): Promise<TrainingGetOneExercise.Response> {
    return {
      data: await this.exercisesService.getOneExercise({
        id: data.id,
        userId: data.userId,
      }),
    };
  }

  @MessagePattern(TrainingCreateExercise.pattern)
  async createExercise(
    @Payload() { data }: TrainingCreateExercise.Request,
  ): Promise<TrainingCreateExercise.Response> {
    return {
      data: await this.exercisesService.createExercise({
        position: 0,
        ...data,
      }),
    };
  }

  @MessagePattern(TrainingUpdateExercise.pattern)
  async updateExercise(
    @Payload() { data }: TrainingUpdateExercise.Request,
  ): Promise<TrainingUpdateExercise.Response> {
    return {
      data: await this.exercisesService.updateExercise({
        id: data.id,
        type: data.type,
        name: data.name,
        exampleUrl: data.exampleUrl,
        userId: data.userId,
        description: data.description,
        repetitions: data.repetitions,
      }),
    };
  }

  @MessagePattern(TrainingDeleteExercise.pattern)
  async deleteExercise(
    @Payload() { data }: TrainingDeleteExercise.Request,
  ): Promise<TrainingDeleteExercise.Response> {
    await this.deleteExercisesWithRepetitions.execute({ id: data.id, userId: data.userId });
    return { data: { id: data.id } };
  }
}
