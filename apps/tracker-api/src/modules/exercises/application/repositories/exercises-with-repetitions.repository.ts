import { DB } from '@/infrastructure/db';
import { ExerciseWithRepetitionsEntity } from '@/modules/exercises';
import { Transaction } from 'kysely';

interface ExercisesWithRepetitionsRepository {
  save(aggregate: ExerciseWithRepetitionsEntity, trx?: Transaction<DB>): Promise<void>;
}

const EXERCISE_WITH_REPETITIONS_REPOSITORY = Symbol('EXERCISE_WITH_REPETITIONS_REPOSITORY');

export { EXERCISE_WITH_REPETITIONS_REPOSITORY, ExercisesWithRepetitionsRepository };
