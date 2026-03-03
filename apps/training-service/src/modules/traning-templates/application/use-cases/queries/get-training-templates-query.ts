import { DB } from '@infrastructure/types';
import { GetExercisesWithRepetitionsQuery } from '@modules/exercises/application';
import { ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Transaction } from 'kysely';
import { TrainingTemplateEntity, TrainingTemplateWithExercisesEntity } from '../../../domain/entities';
import { TRAINING_TEMPLATES_REPOSITORY, TrainingTemplatesRepository } from '../../repositories';

@Injectable()
export class GetTrainingTemplatesQuery {
  constructor(
    @Inject(TRAINING_TEMPLATES_REPOSITORY)
    private readonly trainingTemplateRepo: TrainingTemplatesRepository,

    private readonly getExercisesWithRepetitions: GetExercisesWithRepetitionsQuery,
  ) {}

  async all(input: { userId: number; my?: boolean }, trx?: Transaction<DB>): Promise<TrainingTemplateEntity[]> {
    return await this.trainingTemplateRepo.find({ userId: input.userId, onlyUser: input.my }, trx);
  }

  async one(input: { id: number }, trx?: Transaction<DB>): Promise<TrainingTemplateEntity> {
    const template = await this.trainingTemplateRepo.findOneById({ id: input.id }, trx);
    if (template == null) {
      throw new NotFoundException(`Training template with id ${input.id} not found`);
    }

    return template;
  }

  async oneWithExercises(input: { id: number; userId: number }): Promise<TrainingTemplateWithExercisesEntity> {
    const template = await this.one({ id: input.id });
    const exercises = await this.getExercisesWithRepetitions.all({
      templateId: input.id,
    });

    if (!template.isCommon && template.userId !== input.userId) {
      throw new ForbiddenException('This is not yours template with id: ' + input.id);
    }

    return TrainingTemplateWithExercisesEntity.restore(template).setExercises(exercises);
  }
}
