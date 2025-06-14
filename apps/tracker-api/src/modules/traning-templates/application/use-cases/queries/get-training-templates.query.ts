import { DB } from '@/infrastructure/db';
import {
  TRAINING_TEMPLATES_REPOSITORY,
  TrainingTemplateEntity,
  TrainingTemplatesRepository,
} from '../../training-templates.repository';
import { ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Transaction } from 'kysely';

@Injectable()
export class GetTrainingTemplatesQuery {
  constructor(
    @Inject(TRAINING_TEMPLATES_REPOSITORY)
    private readonly trainingTemplateRepo: TrainingTemplatesRepository,
  ) {}

  async all(
    input: { userId: number; my?: boolean },
    trx?: Transaction<DB>,
  ): Promise<TrainingTemplateEntity[]> {
    return await this.trainingTemplateRepo.find({ userId: input.userId, onlyUser: input.my }, trx);
  }

  async one(
    input: { id: number; userId?: number },
    trx?: Transaction<DB>,
  ): Promise<TrainingTemplateEntity> {
    const training = await this.trainingTemplateRepo.findOneById({ id: input.id }, trx);
    if (training == null) {
      throw new NotFoundException(`Training template with id ${input.id} not found`);
    }
    if (training.userId != null && training.userId !== input.userId) {
      throw new ForbiddenException('This is not yours training template with id ' + input.id);
    }
    return training;
  }
}
