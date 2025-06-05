import { z } from 'zod';
import type { TrainingManageFormData } from './training-template-manage-form';

const requiredMessage = 'Обязательное поле';

const trainingManageValidationSchema: z.Schema<TrainingManageFormData> = z.object({
  name: z
    .string({ required_error: requiredMessage })
    .min(4, { message: 'Не меньше 4 символов' })
    .max(254, { message: 'Слишком длинное имя' }),

  description: z.string().optional(),
  type: z.enum(['LIGHT', 'MEDIUM', 'HARD'] as const, { message: requiredMessage }),
  wormUpDuration: z
    .number({ coerce: true })
    .gt(-1, { message: 'Значение должно быть положительным' })
    .min(3, { message: 'Значение не может быть меньше 3' })
    .max(60, { message: 'Значение не может быть больше 60' })
    .transform((value) => {
      if (value === 0) return undefined;
      return value;
    })
    .optional(),

  postTrainingDuration: z
    .number({ coerce: true })
    .gt(-1, { message: 'Значение должно быть положительным' })
    .min(3, { message: 'Значение не может быть меньше 3' })
    .max(60, { message: 'Значение не может быть больше 60' })
    .transform((value) => {
      if (value === 0) return undefined;
      return value;
    })
    .optional(),

  exerciseList: z.array(
    z.object({
      id: z.number(),
      name: z.string({ message: requiredMessage }),
      sets: z.number({ coerce: true }).gte(1),
      repetitions: z.number({ coerce: true }).gte(1),
    }),
  ),
});

export { trainingManageValidationSchema };
