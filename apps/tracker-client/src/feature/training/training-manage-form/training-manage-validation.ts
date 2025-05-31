import { z } from 'zod';
import type { TrainingManageFormData } from './training-template-manage-form';

const requiredMessage = 'Обязательное поле';

const trainingManageValidationSchema: z.Schema<TrainingManageFormData> = z.object({
  name: z
    .string({ required_error: requiredMessage })
    .min(4, { message: 'Не меньше 4 символов' }),
  description: z.string().optional(),
  type: z.enum(['LIGHT', 'MEDIUM', 'HARD'] as const, { message: requiredMessage }),
  wormUpDuration: z
    .number({ coerce: true })
    .gt(-1, { message: 'Значение должно быть положительным' })
    .transform((value) => {
      if (value === 0) return undefined;
      return value;
    })
    .optional(),

  postTrainingDuration: z
    .number({ coerce: true })
    .gt(-1, { message: 'Значение должно быть положительным' })
    .transform((value) => {
      if (value === 0) return undefined;
      return value;
    })
    .optional(),
});

export { trainingManageValidationSchema };
