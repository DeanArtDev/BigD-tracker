import { TrainingsTemplatesRepository } from '@/tranings/trainings-templates.repository';
import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Nullable } from 'kysely';
import { TrainingType } from './dtos/training.dto';
import { TrainingsMapper } from './trainings.mapper';
import { TrainingsRepository } from './trainings.repository';

@Injectable()
export class TrainingsService {
  constructor(
    readonly trainingsRepository: TrainingsRepository,
    readonly trainingsTemplatesRepository: TrainingsTemplatesRepository,
    readonly trainingsMapper: TrainingsMapper,
  ) {}

  async findTraining(data: { id: number }) {
    const rowTraining = await this.trainingsRepository.findOneById({ id: data.id });
    if (rowTraining == null) {
      throw new NotFoundException('Training is not found');
    }
    return rowTraining;
  }

  async createTrainingTemplate(data: {
    userId?: number;
    name: string;
    type: TrainingType;
    description?: string;
    wormUpDuration?: number;
    postTrainingDuration?: number;
  }) {
    const rowTraining = await this.trainingsTemplatesRepository.create(data);
    if (rowTraining == null) {
      throw new InternalServerErrorException('Failed to create training');
    }
    return rowTraining;
  }

  async findTemplatesByFilters({ userId }: { userId?: number }) {
    return await this.trainingsTemplatesRepository.findByFilters({ userId });
  }

  async updateTrainingTemplateAndReplace(
    id: number,
    data: { name: string; type: TrainingType } & Nullable<{
      description: string;
      wormUpDuration: number;
      postTrainingDuration: number;
    }>,
  ) {
    const training = await this.trainingsTemplatesRepository.findOneById({ id });
    if (training == null) {
      throw new NotFoundException(`training with id ${id} not found`);
    }

    const updatedTemplate = await this.trainingsTemplatesRepository.updateAndReplace(id, data);
    if (updatedTemplate == null) {
      throw new InternalServerErrorException({ id }, { cause: 'Failed to update' });
    }

    return updatedTemplate;
  }

  async deleteTrainingTemplate(data: { id: number; userId: number }) {
    const template = await this.trainingsTemplatesRepository.findOneById({ id: data.id });
    if (template?.user_id !== data.userId) {
      throw new ForbiddenException('delete can only your own training templates');
    }
    const isDeleted = await this.trainingsTemplatesRepository.delete(data);
    if (!isDeleted) {
      throw new NotFoundException(`Training with id ${data.id} not found`);
    }
  }
}
