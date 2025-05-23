import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { TrainingsRepository } from './trainings.repository';
import { TrainingType } from './dtos/training.dto';
import { UsersService } from '@/users/users.service';

@Injectable()
export class TrainingsService {
  constructor(
    readonly userService: UsersService,
    readonly trainingsRepository: TrainingsRepository,
  ) {}

  async getTrainingsByUserId(data: { userId: number }) {
    return await this.trainingsRepository.getAllByUserId(data);
  }

  async deleteTraining(data: { id: number }) {
    const isDeleted = await this.trainingsRepository.delete(data);
    if (!isDeleted) {
      throw new NotFoundException(`Training with id ${data.id} not found`);
    }
    return true;
  }

  async updateTraining(data: {
    id: number;
    name?: string;
    type?: TrainingType;
    description?: string;
    startDate?: Date;
    endDate?: Date;
    wormUpDuration?: number;
    postTrainingDuration?: number;
  }) {
    const training = await this.trainingsRepository.findOneById({ id: data.id });
    if (training == null) {
      throw new NotFoundException(`training with id ${data.id} not found`);
    }

    const updatedTraining = await this.trainingsRepository.update(data);
    if (updatedTraining == null) {
      throw new InternalServerErrorException(
        { id: data.id },
        { cause: 'Failed to update' },
      );
    }

    return updatedTraining;
  }

  async createTraining(data: {
    userId: number;
    name: string;
    type: TrainingType;
    description?: string;
    startDate?: Date;
    endDate?: Date;
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
}
