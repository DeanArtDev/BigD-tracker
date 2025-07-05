import type { ApiDto } from '@/shared/api/types';

const mapTrainingType: Record<ApiDto['TrainingWithExercisesDto']['type'], string> = {
  LIGHT: 'Лёгкая',
  MEDIUM: 'Средняя',
  HARD: 'Тяжелая',
  MIXED: 'Смешаная',
};

export { mapTrainingType };
