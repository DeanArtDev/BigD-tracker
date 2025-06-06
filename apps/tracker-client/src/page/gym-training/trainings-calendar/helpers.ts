import type { ApiDto } from '@/shared/api/types';

function getTraining(extra: object): ApiDto['TrainingAggregationDto'] {
  return extra as ApiDto['TrainingAggregationDto'];
}

export { getTraining };
