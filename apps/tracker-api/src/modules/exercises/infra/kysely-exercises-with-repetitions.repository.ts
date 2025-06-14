import { DB, KyselyService } from '@/infrastructure/db';
import { ExercisesWithRepetitionsRepository } from '../application/repositories/exercises-with-repetitions.repository';
import { REPETITIONS_REPOSITORY, RepetitionsRepository } from '@/modules/repetitions';
import { Inject, Injectable } from '@nestjs/common';
import {
  ISyncCollectionMethods,
  SyncCollectionRepository,
  SyncCollectionRepositoryHelper,
} from '@shared/core/repository';
import { BaseRepository } from '@shared/core/repository/base-repository';
import { Transaction } from 'kysely';
import {
  EXERCISE_REPOSITORY,
  ExercisesRepository,
} from '../application/repositories/exercises.repository';
import { ExerciseWithRepetitionsEntity } from '../domain/exercise-with-repetitions.entity';

@Injectable()
export class KyselyExercisesWithRepetitionsRepository
  extends BaseRepository<DB>
  implements
    ISyncCollectionMethods<ExerciseWithRepetitionsEntity, DB>,
    ExercisesWithRepetitionsRepository
{
  private syncCollection: SyncCollectionRepositoryHelper<ExerciseWithRepetitionsEntity, DB>;

  constructor(
    private readonly kyselyService: KyselyService,

    @Inject(REPETITIONS_REPOSITORY)
    private readonly repetitionsRepo: RepetitionsRepository,

    @Inject(EXERCISE_REPOSITORY)
    private readonly exercisesRepository: ExercisesRepository,

    private readonly syncCollectionRepo: SyncCollectionRepository<DB>,
  ) {
    super(kyselyService.db);

    this.syncCollection = new SyncCollectionRepositoryHelper<ExerciseWithRepetitionsEntity, DB>({
      upsertRoot: this.upsertRoot.bind(this),
      sync: this.sync.bind(this),
      db: this.kyselyService.db,
    });
  }

  async save(aggregate: ExerciseWithRepetitionsEntity, trx?: Transaction<DB>): Promise<void> {
    await this.syncCollection.save(aggregate, trx);
  }

  async upsertRoot(exercise: ExerciseWithRepetitionsEntity, trx: Transaction<DB>): Promise<void> {
    await this.exercisesRepository.upsert(
      {
        id: exercise.id,
        type: exercise.type,
        name: exercise.name,
        user_id: exercise.userId,
        example_url: exercise.exampleUrl,
        description: exercise.description,
        training_id: exercise.trainingId,
        training_template_id: exercise.trainingTemplateId,
      },
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
