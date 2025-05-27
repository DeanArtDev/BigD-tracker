import type { ApiDto } from '@/shared/api/types';

const mapTrainingType: Record<ApiDto['TrainingDto']['type'], string> = {
  LIGHT: 'Лёгкая',
  MEDIUM: 'Средняя',
  HARD: 'Тяжелая',
};

export { mapTrainingType };
