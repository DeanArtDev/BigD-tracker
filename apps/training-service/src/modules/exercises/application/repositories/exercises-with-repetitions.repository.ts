import { ExerciseWithRepetitionsEntity } from '@modules/exercises/domain';
import { DB } from '@big-d/database';
import { Transaction } from 'kysely';

interface ExercisesWithRepetitionsRepository {
  save(aggregate: ExerciseWithRepetitionsEntity, trx?: Transaction<DB>): Promise<void>;
}

const EXERCISE_WITH_REPETITIONS_REPOSITORY = Symbol('EXERCISE_WITH_REPETITIONS_REPOSITORY');

export { EXERCISE_WITH_REPETITIONS_REPOSITORY, ExercisesWithRepetitionsRepository };
