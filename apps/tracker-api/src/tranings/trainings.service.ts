import { TrainingsTemplatesRepository } from '@/tranings/trainings-templates.repository';
import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { TrainingsMapper } from './trainings.mapper';
import { TrainingsRepository } from './trainings.repository';

@Injectable()
export class TrainingsService {
  constructor(
    readonly trainingsRepository: TrainingsRepository,
    readonly trainingsTemplatesRepository: TrainingsTemplatesRepository,
    readonly trainingsMapper: TrainingsMapper,
  ) {}

  async findTrainingById(data: { id: number }) {
    const rowTraining = await this.trainingsRepository.findOneById({ id: data.id });
    if (rowTraining == null) {
      throw new NotFoundException('Training is not found');
    }
    return rowTraining;
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
