import type { ApiDto } from '@/shared/api/types';

const mapExerciseType: Record<ApiDto['ExerciseWithRepetitionsDto']['type'], string> = {
  'AEROBIC': 'аэробное',
  'ANAEROBIC': 'анаэробное',
  'WORM-UP': 'разминочное',
  'POST-TRAINING': 'заминочное',
};

export { mapExerciseType };
