import {
  TrainingCreateTemplate,
  TrainingDeleteTemplate,
  TrainingGetOneTemplate,
  TrainingGetTrainingTemplates,
  TrainingUpdateTemplate,
} from '@big-d/api-contracts';
import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { TrainingTemplatesService } from './training-templates.service';
import { DeleteTrainingTemplateCommand } from './use-cases';

@Controller()
export class TrainingTemplatesController {
  constructor(
    private readonly trainingTemplatesService: TrainingTemplatesService,
    private readonly deleteTrainingTemplateCommand: DeleteTrainingTemplateCommand,
  ) {}

  @MessagePattern(TrainingGetTrainingTemplates.pattern)
  async getTrainingTemplates(
    @Payload() { data }: TrainingGetTrainingTemplates.Request,
  ): Promise<TrainingGetTrainingTemplates.Response> {
    return {
      data: await this.trainingTemplatesService.all({
        userId: data.userId,
        my: Boolean(data.my),
      }),
    };
  }

  @MessagePattern(TrainingCreateTemplate.pattern)
  async createTemplates(
    @Payload() { data }: TrainingCreateTemplate.Request,
  ): Promise<TrainingCreateTemplate.Response> {
    return {
      data: await this.trainingTemplatesService.createOneWithExercises({
        userId: data.userId,
        type: data.type,
        description: data.description,
        name: data.name,
        exercises: data.exercises,
        postTrainingDuration: data.postTrainingDuration,
        wormUpDuration: data.wormUpDuration,
      }),
    };
  }

  @MessagePattern(TrainingGetOneTemplate.pattern)
  async getOneTemplate(
    @Payload() { data }: TrainingGetOneTemplate.Request,
  ): Promise<TrainingGetOneTemplate.Response> {
    return {
      data: await this.trainingTemplatesService.oneWithExercises({
        userId: data.userId,
        id: data.id,
      }),
    };
  }

  @MessagePattern(TrainingUpdateTemplate.pattern)
  async updateTemplate(
    @Payload() { data }: TrainingUpdateTemplate.Request,
  ): Promise<TrainingUpdateTemplate.Response> {
    return {
      data: await this.trainingTemplatesService.updateOneWithExercises(data),
    };
  }

  @MessagePattern(TrainingDeleteTemplate.pattern)
  async deleteTemplate(
    @Payload() { data }: TrainingDeleteTemplate.Request,
  ): Promise<TrainingDeleteTemplate.Response> {
    await this.deleteTrainingTemplateCommand.execute({ id: data.id, userId: data.userId });
    return {
      data: { id: data.id },
    };
  }
}
