import type { ApiSchemas } from '@/shared/api/types';

const mapTrainingType: Record<ApiSchemas['TrainingWithExercisesDto']['type'], string> = {
  LIGHT: 'Лёгкая',
  MEDIUM: 'Средняя',
  HARD: 'Тяжелая',
  MIXED: 'Смешаная',
};

export { mapTrainingType };
