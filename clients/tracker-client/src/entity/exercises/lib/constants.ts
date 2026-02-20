import type { ApiSchemas } from '@/shared/api/types';

const mapExerciseType: Record<ApiSchemas['ExerciseWithRepetitionsDto']['type'], string> = {
  'AEROBIC': 'аэробное',
  'ANAEROBIC': 'анаэробное',
  'WORM-UP': 'разминочное',
  'POST-TRAINING': 'заминочное',
};

export { mapExerciseType };
