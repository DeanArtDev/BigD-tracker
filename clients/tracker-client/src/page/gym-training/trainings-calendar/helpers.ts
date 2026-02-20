import type { ApiSchemas } from '@/shared/api/types';

function getTraining(extra: object): ApiSchemas['TrainingWithExercisesDto'] {
  return extra as ApiSchemas['TrainingWithExercisesDto'];
}

export { getTraining };
