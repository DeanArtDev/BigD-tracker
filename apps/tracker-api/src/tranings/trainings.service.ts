import { TrainingsTemplatesRepository } from '@/tranings/trainings-templates.repository';
import { UsersService } from '@/users/users.service';
import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Nullable } from 'kysely';
import { TrainingType } from './dtos/training.dto';
import { TrainingsRepository } from './trainings.repository';

@Injectable()
export class TrainingsService {
  constructor(
    readonly userService: UsersService,
    readonly trainingsRepository: TrainingsRepository,
    readonly trainingsTemplatesRepository: TrainingsTemplatesRepository,
  ) {}

  async filterByRangeForUser(filters: { userId: number; to?: string; from?: string }) {
    return await this.trainingsRepository.filterByRangeForUser(filters);
  }

  async deleteTraining(data: { id: number }) {
    const isDeleted = await this.trainingsRepository.delete(data);
    if (!isDeleted) {
      throw new NotFoundException(`Training with id ${data.id} not found`);
    }
  }

  async updateTrainingPartly(
    id: number,
    data: {
      name?: string;
      type?: TrainingType;
      startDate?: string;
      description?: string;
      endDate?: string;
      wormUpDuration?: number;
      postTrainingDuration?: number;
    },
  ) {
    const training = await this.trainingsRepository.findOneById({ id });
    if (training == null) {
      throw new NotFoundException(`training with id ${id} not found`);
    }

    const updatedTraining = await this.trainingsRepository.updatePartly(id, data);
    if (updatedTraining == null) {
      throw new InternalServerErrorException({ id }, { cause: 'Failed to update' });
    }

    return updatedTraining;
  }

  async updateTrainingAndReplace(
    id: number,
    data: {
      name: string;
      type: TrainingType;
      startDate: string;
    } & Nullable<{
      description: string;
      endDate: string;
      wormUpDuration: number;
      postTrainingDuration: number;
    }>,
  ) {
    const training = await this.trainingsRepository.findOneById({ id });
    if (training == null) {
      throw new NotFoundException(`training with id ${id} not found`);
    }

    const updatedTraining = await this.trainingsRepository.updateAndReplace(id, data);
    if (updatedTraining == null) {
      throw new InternalServerErrorException({ id }, { cause: 'Failed to update' });
    }

    return updatedTraining;
  }

  async createTraining(data: {
    userId: number;
    name: string;
    type: TrainingType;
    description?: string;
    startDate?: string;
    endDate?: string;
    wormUpDuration?: number;
    postTrainingDuration?: number;
  }) {
    await this.userService.findUser({ id: data.userId });
    const rowTraining = await this.trainingsRepository.create(data);
    if (rowTraining == null) {
      throw new InternalServerErrorException('Failed to create training');
    }
    return rowTraining;
  }

  async createTrainingTemplate(data: {
    userId: number;
    name: string;
    type: TrainingType;
    description?: string;
    wormUpDuration?: number;
    postTrainingDuration?: number;
  }) {
    await this.userService.findUser({ id: data.userId });
    const rowTraining = await this.trainingsTemplatesRepository.create(data);
    if (rowTraining == null) {
      throw new InternalServerErrorException('Failed to create training');
    }
    return rowTraining;
  }

  async getCommonTemplates() {
    return await this.trainingsTemplatesRepository.getCommonTemplates();
  }

  async getTemplatesByUserId(id: number) {
    return await this.trainingsTemplatesRepository.findByUserId({ userId: id });
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
