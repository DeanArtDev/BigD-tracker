import {
  TrainingAssignTrainings,
  TrainingCreateTraining,
  TrainingCreateTrainingByTemplate,
  TrainingDeleteTraining,
  TrainingFinishTraining,
  TrainingGetActiveTraining,
  TrainingGetOneTraining,
  TrainingGetTrainings,
  TrainingSetBreakFact,
  TrainingSetFact,
  TrainingStartTraining,
  TrainingUpdateTraining,
} from '@big-d/api-contracts';
import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { TrainingsService } from './trainings.service';
import { AssignTrainingCommand, DeleteTrainingCommand, ProcessTrainingCommand } from './use-cases';

@Controller()
export class TrainingsController {
  constructor(
    private readonly trainingsService: TrainingsService,
    private readonly deleteTrainingCommand: DeleteTrainingCommand,
    private readonly assignTrainingCommand: AssignTrainingCommand,
    private readonly processTrainingCommand: ProcessTrainingCommand,
  ) {}

  @MessagePattern(TrainingGetActiveTraining.pattern)
  async getActiveTraining(
    @Payload() { data }: TrainingGetActiveTraining.Request,
  ): Promise<TrainingGetActiveTraining.Response> {
    return {
      data: await this.trainingsService.getActiveTraining({
        userId: data.userId,
      }),
    };
  }

  @MessagePattern(TrainingGetTrainings.pattern)
  async getTrainings(
    @Payload() { data }: TrainingGetTrainings.Request,
  ): Promise<TrainingGetTrainings.Response> {
    return {
      data: await this.trainingsService.all({
        userId: data.userId,
        to: data.to,
        from: data.from,
      }),
    };
  }

  @MessagePattern(TrainingGetOneTraining.pattern)
  async getOneTraining(
    @Payload() { data }: TrainingGetOneTraining.Request,
  ): Promise<TrainingGetOneTraining.Response> {
    return {
      data: await this.trainingsService.oneWithExercises({
        userId: data.userId,
        id: data.id,
      }),
    };
  }

  @MessagePattern(TrainingCreateTraining.pattern)
  async createTraining(
    @Payload() { data }: TrainingCreateTraining.Request,
  ): Promise<TrainingCreateTraining.Response> {
    return {
      data: await this.trainingsService.createWithExercises(data),
    };
  }

  @MessagePattern(TrainingCreateTrainingByTemplate.pattern)
  async createTrainingByTemplate(
    @Payload() { data }: TrainingCreateTrainingByTemplate.Request,
  ): Promise<TrainingCreateTrainingByTemplate.Response> {
    return {
      data: await this.trainingsService.crateTrainingByTemplate(data),
    };
  }

  @MessagePattern(TrainingUpdateTraining.pattern)
  async updateTraining(
    @Payload() { data }: TrainingUpdateTraining.Request,
  ): Promise<TrainingUpdateTraining.Response> {
    return {
      data: await this.trainingsService.updateWithExercises(data),
    };
  }

  @MessagePattern(TrainingAssignTrainings.pattern)
  async assignTrainings(
    @Payload() { data }: TrainingAssignTrainings.Request,
  ): Promise<TrainingAssignTrainings.Response> {
    await this.assignTrainingCommand.execute(data.items, data.userId);
    return {
      data: true,
    };
  }

  @MessagePattern(TrainingStartTraining.pattern)
  async startTrainings(
    @Payload() { data }: TrainingStartTraining.Request,
  ): Promise<TrainingStartTraining.Response> {
    await this.processTrainingCommand.start(data);
    return { data: { id: data.id } };
  }

  @MessagePattern(TrainingFinishTraining.pattern)
  async finishTrainings(
    @Payload() { data }: TrainingFinishTraining.Request,
  ): Promise<TrainingFinishTraining.Response> {
    await this.processTrainingCommand.finish(data);
    return { data: { id: data.id } };
  }

  @MessagePattern(TrainingSetFact.pattern)
  async setFact(@Payload() { data }: TrainingSetFact.Request): Promise<TrainingSetFact.Response> {
    await this.processTrainingCommand.setRepetitionFact(data);
    return { data: { repetitionId: data.repetitionId, trainingId: data.trainingId } };
  }

  @MessagePattern(TrainingSetBreakFact.pattern)
  async setBreakFact(
    @Payload() { data }: TrainingSetBreakFact.Request,
  ): Promise<TrainingSetBreakFact.Response> {
    await this.processTrainingCommand.setRepetitionBreak(data);
    return { data: { repetitionId: data.repetitionId, trainingId: data.trainingId } };
  }

  @MessagePattern(TrainingDeleteTraining.pattern)
  async deleteTraining(
    @Payload() { data }: TrainingDeleteTraining.Request,
  ): Promise<TrainingDeleteTraining.Response> {
    await this.deleteTrainingCommand.execute(data.id, data.userId);
    return { data: { id: data.id } };
  }
}
