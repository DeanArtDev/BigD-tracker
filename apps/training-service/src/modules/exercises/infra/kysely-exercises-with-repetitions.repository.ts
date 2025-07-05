import {
  BaseRepository,
  ISyncCollectionMethods,
  SyncCollectionRepository,
  SyncCollectionRepositoryHelper,
} from '@big-d/api-utils';
import { Database, DATABASE_CONNECTION, DB } from '@big-d/database';
import {
  EXERCISE_REPOSITORY,
  ExercisesRepository,
  ExercisesWithRepetitionsRepository,
} from '@modules/exercises/application';
import { ExerciseWithRepetitionsEntity } from '@modules/exercises/domain';
import { REPETITIONS_REPOSITORY, RepetitionsRepository } from '@modules/repetitions';
import { Inject, Injectable } from '@nestjs/common';
import { Transaction } from 'kysely';

@Injectable()
export class KyselyExercisesWithRepetitionsRepository
  extends BaseRepository<DB>
  implements
    ISyncCollectionMethods<ExerciseWithRepetitionsEntity, DB>,
    ExercisesWithRepetitionsRepository
{
  private syncCollection: SyncCollectionRepositoryHelper<ExerciseWithRepetitionsEntity, DB>;

  constructor(
    @Inject(REPETITIONS_REPOSITORY)
    private readonly repetitionsRepo: RepetitionsRepository,

    @Inject(EXERCISE_REPOSITORY)
    private readonly exercisesRepository: ExercisesRepository,

    @Inject(DATABASE_CONNECTION) private readonly database: Database<DB>,
    private readonly syncCollectionRepo: SyncCollectionRepository<DB>,
  ) {
    super(database);

    this.syncCollection = new SyncCollectionRepositoryHelper<ExerciseWithRepetitionsEntity, DB>({
      upsertRoot: this.upsertRoot.bind(this),
      sync: this.sync.bind(this),
    });
  }

  async save(aggregate: ExerciseWithRepetitionsEntity, trx: Transaction<DB>): Promise<void> {
    await this.syncCollection.save(aggregate, trx);
  }

  async upsertRoot(exercise: ExerciseWithRepetitionsEntity, trx: Transaction<DB>): Promise<void> {
    await this.exercisesRepository.upsert(
      {
        id: exercise.id,
        position: exercise.position,
        type: exercise.type,
        name: exercise.name,
        user_id: exercise.userId,
        example_url: exercise.exampleUrl,
        description: exercise.description,
        training_id: exercise.trainingId,
        training_template_id: exercise.trainingTemplateId,
      },
      { replace: true },
      trx,
    );
  }

  async sync(aggregate: ExerciseWithRepetitionsEntity, trx: Transaction<DB>): Promise<void> {
    const delta = await this.syncCollectionRepo.execute({
      trx,
      tableName: 'repetitions',
      parent: { id: aggregate.id, field: 'exercise_id' },
      newRowsIds: aggregate.repetitions.map((e) => e.id),
    });

    for (const rep of aggregate.repetitions) {
      if (delta.toInsert.includes(rep.id)) {
        await this.repetitionsRepo.createMany(
          [
            {
              position: rep.position,
              description: rep.description,
              user_id: rep.userId,
              target_weight: rep.targetWeight,
              exercise_id: rep.exerciseId,
              target_count: rep.targetCount,
              target_break: rep.targetBreak,
            },
          ],
          trx,
        );
      }

      if (delta.toKeep.includes(rep.id)) {
        await this.repetitionsRepo.update(
          {
            id: rep.id,
            position: rep.position,
            description: rep.description,
            user_id: rep.userId,
            target_weight: rep.targetWeight,
            exercise_id: rep.exerciseId,
            target_count: rep.targetCount,
            target_break: rep.targetBreak,
          },
          trx,
        );
      }
    }
  }
}
