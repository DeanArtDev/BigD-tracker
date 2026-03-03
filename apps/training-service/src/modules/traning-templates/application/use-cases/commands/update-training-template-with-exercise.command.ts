import {
  CreateExercisesWithRepetitionsCommand,
  UpdateExercisesWithRepetitionsCommand,
} from '@/modules/exercises/application/use-cases';
import { TrainingTemplateWithExercisesEntity } from '@/modules/traning-templates/domain/entities';
import { ExerciseType, TrainingType } from '@big-d/api-contracts';
import {
  ISyncCollectionMethods,
  KyselyUnitOfWork,
  SyncCollectionRepository,
  SyncCollectionRepositoryHelper,
} from '@big-d/api-utils';
import { Database, DATABASE_CONNECTION } from '@big-d/database';
import { DB } from '@infrastructure/types';
import { ForbiddenException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { Transaction } from 'kysely';
import { TRAINING_TEMPLATES_REPOSITORY, TrainingTemplatesRepository } from '../../repositories';
import { GetTrainingTemplatesQuery } from '../queries/get-training-templates-query';

interface UpdateTrainingTemplateWithExercisesInput {
  readonly id: number;
  readonly userId: number;
  readonly name: string;
  readonly type: TrainingType;
  readonly postTrainingDuration?: number;
  readonly wormUpDuration?: number;
  readonly description?: string;
  readonly exercises: {
    readonly id: number;
    readonly name: string;
    readonly type: ExerciseType;
    readonly description?: string;
    readonly exampleUrl?: string;
    readonly repetitions: {
      readonly id?: number;
      readonly targetCount: number;
      readonly targetWeight: string;
      readonly targetBreak: number;
      readonly description?: string;
    }[];
  }[];
}

@Injectable()
class UpdateTrainingTemplateWithExercisesCommand
  extends KyselyUnitOfWork<DB>
  implements ISyncCollectionMethods<TrainingTemplateWithExercisesEntity, DB>
{
  private syncCollection: SyncCollectionRepositoryHelper<TrainingTemplateWithExercisesEntity, DB>;
  private userId: number;

  constructor(
    @Inject(DATABASE_CONNECTION) private readonly database: Database<DB>,

    @Inject(TRAINING_TEMPLATES_REPOSITORY)
    private readonly trainingTemplateRepo: TrainingTemplatesRepository,
    private readonly getTrainingTemplatesQuery: GetTrainingTemplatesQuery,

    private readonly updateExercisesWithRepetitions: UpdateExercisesWithRepetitionsCommand,
    private readonly createExercisesWithRepetitions: CreateExercisesWithRepetitionsCommand,

    private readonly syncCollectionRepo: SyncCollectionRepository<DB>,
  ) {
    super(database);
    this.syncCollection = new SyncCollectionRepositoryHelper<TrainingTemplateWithExercisesEntity, DB>({
      upsertRoot: this.upsertRoot.bind(this),
      sync: this.sync.bind(this),
    });
  }

  async execute(input: UpdateTrainingTemplateWithExercisesInput): Promise<TrainingTemplateWithExercisesEntity> {
    const { exercises: exercisesDto, ...templateDto } = input;
    this.userId = templateDto.userId;

    return await this.runTransaction(async (transaction) => {
      const template = await this.getTrainingTemplatesQuery.oneWithExercises({
        id: templateDto.id,
        userId: templateDto.userId,
      });

      if (template.isCommon) {
        throw new ForbiddenException('Common template cannot be changed');
      }

      template.update({
        type: templateDto.type,
        name: templateDto.name,
        description: templateDto.description,
        postTrainingDuration: templateDto.postTrainingDuration,
        wormUpDuration: templateDto.wormUpDuration,
      });
      template.updateExercises(
        exercisesDto.map((exercise, index) => {
          return {
            ...exercise,
            position: index,
          };
        }),
      );

      await this.syncCollection.save(template, transaction);

      return await this.getTrainingTemplatesQuery.oneWithExercises({
        id: templateDto.id,
        userId: templateDto.userId,
      });
    });
  }

  async upsertRoot(aggregate: TrainingTemplateWithExercisesEntity, trx: Transaction<DB>): Promise<void> {
    await this.trainingTemplateRepo.upsert(
      {
        id: aggregate.id,
        type: aggregate.type,
        name: aggregate.name,
        user_id: aggregate.userId,
        description: aggregate.description,
        worm_up_duration: aggregate.wormUpDuration,
        post_training_duration: aggregate.postTrainingDuration,
      },
      { replace: true },
      trx,
    );
  }

  async sync(aggregate: TrainingTemplateWithExercisesEntity, trx: Transaction<DB>): Promise<void> {
    if (this.userId == null) {
      throw new UnauthorizedException('Template can be updated only by its owner');
    }

    const delta = await this.syncCollectionRepo.execute({
      trx,
      tableName: 'exercises',
      parent: { id: aggregate.id, field: 'training_template_id' },
      newRowsIds: aggregate.exercises.map((e) => e.id),
    });

    for (const exercise of aggregate.exercises) {
      if (delta.toInsert.includes(exercise.id)) {
        await this.createExercisesWithRepetitions.execute(
          {
            position: exercise.position,
            exampleUrl: exercise.exampleUrl,
            name: exercise.name,
            type: exercise.type,
            templateId: aggregate.id,
            userId: this.userId,
            description: exercise.description,
            repetitions: exercise.repetitions.map((rep) => {
              return {
                targetCount: rep.targetCount,
                targetWeight: rep.targetWeight,
                description: rep.description,
                targetBreak: rep.targetBreak,
              };
            }),
          },
          trx,
        );
      }

      if (delta.toKeep.includes(exercise.id)) {
        await this.updateExercisesWithRepetitions.execute(exercise, trx);
      }
    }
  }
}

export { UpdateTrainingTemplateWithExercisesCommand, UpdateTrainingTemplateWithExercisesInput };
