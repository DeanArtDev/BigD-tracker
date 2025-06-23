import { DB } from '@/infrastructure/db';
import { GetExercisesWithRepetitionsQuery } from '@/modules/exercises';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { KyselyUnitOfWork } from '@shared/core/uow';
import { Transaction } from 'kysely';
import {
  TrainingTemplateEntity,
  TrainingTemplateWithExercisesEntity,
} from '../../../domain/entities';
import { TRAINING_TEMPLATES_REPOSITORY, TrainingTemplatesRepository } from '../../repositories';

@Injectable()
export class GetTrainingTemplatesQuery {
  constructor(
    @Inject(TRAINING_TEMPLATES_REPOSITORY)
    private readonly trainingTemplateRepo: TrainingTemplatesRepository,

    private readonly getExercisesWithRepetitions: GetExercisesWithRepetitionsQuery,

    private readonly unitOfWork: KyselyUnitOfWork,
  ) {}

  async all(
    input: { userId: number; my?: boolean },
    trx?: Transaction<DB>,
  ): Promise<TrainingTemplateEntity[]> {
    return await this.trainingTemplateRepo.find({ userId: input.userId, onlyUser: input.my }, trx);
  }

  async one(input: { id: number }, trx?: Transaction<DB>): Promise<TrainingTemplateEntity> {
    const template = await this.trainingTemplateRepo.findOneById({ id: input.id }, trx);
    if (template == null) {
      throw new NotFoundException(`Training template with id ${input.id} not found`);
    }

    return template;
  }

  async oneWithExercises(input: {
    id: number;
    userId?: number;
  }): Promise<TrainingTemplateWithExercisesEntity> {
    return await this.unitOfWork.execute(async (transaction) => {
      const template = await this.one({ id: input.id }, transaction);
      const exercises = await this.getExercisesWithRepetitions.all({
        templateId: input.id,
      });

      return TrainingTemplateWithExercisesEntity.restore(template).setExercises(exercises);
    });
  }
}
