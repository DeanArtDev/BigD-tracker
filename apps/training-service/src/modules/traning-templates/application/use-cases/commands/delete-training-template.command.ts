import {
  ForbiddenException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { TRAINING_TEMPLATES_REPOSITORY, TrainingTemplatesRepository } from '../../repositories';

@Injectable()
class DeleteTrainingTemplateCommand {
  constructor(
    @Inject(TRAINING_TEMPLATES_REPOSITORY)
    private readonly trainingTemplateRepo: TrainingTemplatesRepository,
  ) {}

  async execute(input: { id: number; userId: number }): Promise<void> {
    const template = await this.trainingTemplateRepo.findOneById({ id: input.id });
    if (!template) {
      throw new NotFoundException(`Training template with id ${input.id} is not found`);
    }

    if (input.userId != null && template.userId !== input.userId) {
      throw new ForbiddenException('This is not yours training template with id ' + input.id);
    }

    if (!(await this.trainingTemplateRepo.delete({ id: input.id }))) {
      throw new InternalServerErrorException('Failed to delete training template');
    }
  }
}

export { DeleteTrainingTemplateCommand };
