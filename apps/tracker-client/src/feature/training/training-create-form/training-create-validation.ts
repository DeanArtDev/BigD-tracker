import { z } from 'zod';
import type { TrainingCreateFormData } from './training-create-form';

const requiredMessage = 'Обязательное поле';

const trainingCreateValidationSchema: z.Schema<TrainingCreateFormData> = z.object({
  name: z
    .string({ required_error: requiredMessage })
    .min(4, { message: 'Не меньше 4 символов' }),
  description: z.string().optional(),
  type: z.enum(['LIGHT', 'MEDIUM', 'HARD'] as const, { message: requiredMessage }),
  startDate: z.date().optional(),
  wormUpDuration: z
    .number()
    .positive({ message: 'Значение должно быть положительным' })
    .optional(),
  postTrainingDuration: z
    .number()
    .positive({ message: 'Значение должно быть положительным' })
    .optional(),
});

export { trainingCreateValidationSchema };
