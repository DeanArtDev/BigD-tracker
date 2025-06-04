import { PutTrainingTemplateRequest } from '@/tranings/dtos/put-training-template.dto';
import { TrainingEntity } from '@/tranings/entities/training.entity';
import { TrainingsTemplatesRepository } from '@/tranings/trainings-templates.repository';
import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { TrainingsMapper } from './trainings.mapper';
import { TrainingsRepository } from './trainings.repository';

@Injectable()
export class TrainingsService {
  constructor(
    readonly trainingsRepository: TrainingsRepository,
    readonly trainingsTemplatesRepository: TrainingsTemplatesRepository,
    readonly trainingsMapper: TrainingsMapper,
  ) {}

  async setStartDataAtTemplate(data: {
    startDate: string;
    templateId: number;
    userId: number;
  }): Promise<TrainingEntity> {
    const rawTemplate = await this.findTrainingTemplateById({ id: data.templateId });
    const entity = this.trainingsMapper.fromPersistenceToEntity({
      ...rawTemplate,
      start_date: new Date(data.startDate),
      end_date: null,
      user_id: data.userId,
    });
    const persistenceData = this.trainingsMapper.fromEntityToPersistence(entity);
    const rawTraining = await this.trainingsRepository.create(persistenceData);
    if (rawTraining == null) {
      throw new InternalServerErrorException('Failed to assign start_date to training');
    }
    return this.trainingsMapper.fromPersistenceToEntity(rawTraining);
  }

  async setStartDataAtTraining(data: {
    startDate: string;
    trainingId: number;
  }): Promise<TrainingEntity> {
    await this.findTrainingById({ id: data.trainingId });

    const rawTraining = await this.trainingsRepository.update({
      id: data.trainingId,
      start_date: data.startDate,
    });
    if (rawTraining == null) {
      throw new InternalServerErrorException('Failed to assign start_date to training');
    }
    return this.trainingsMapper.fromPersistenceToEntity(rawTraining);
  }

  async findTrainingById(data: { id: number }) {
    const rowTraining = await this.trainingsRepository.findOneById({ id: data.id });
    if (rowTraining == null) {
      throw new NotFoundException('Training is not found');
    }
    return rowTraining;
  }

  async findTrainingTemplateById(data: { id: number }) {
    const rawTemplate = await this.trainingsTemplatesRepository.findOneById({ id: data.id });
    if (rawTemplate == null) {
      throw new NotFoundException('Template is not found');
    }
    return rawTemplate;
  }

  async updateTrainingTemplateAndReplace(id: number, data: PutTrainingTemplateRequest['data']) {
    const training = await this.trainingsTemplatesRepository.findOneById({ id });
    if (training == null) {
      throw new NotFoundException(`training with id ${id} not found`);
    }

    const updatedTemplate = await this.trainingsTemplatesRepository.update(
      { ...data, id },
      { replace: true },
    );
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
