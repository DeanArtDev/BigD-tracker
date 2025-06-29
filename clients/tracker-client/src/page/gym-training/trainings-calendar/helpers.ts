import type { ApiDto } from '@/shared/api/types';

function getTraining(extra: object): ApiDto['TrainingWithExercisesDto'] {
  return extra as ApiDto['TrainingWithExercisesDto'];
}

export { getTraining };
