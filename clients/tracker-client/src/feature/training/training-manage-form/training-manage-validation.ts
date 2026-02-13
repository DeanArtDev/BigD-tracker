import { z } from 'zod';
import { transformPlaceholder } from '@/shared/lib/utils/zod';

const requiredMessage = 'Обязательное поле';

const repetitionSchema = z.object({
  id: z.number().optional(),

  targetCount: z
    .number({ error: requiredMessage })
    .int({ message: 'Значение должно быть целым' })
    .gte(1, { message: 'Значение не может быть меньше 1' })
    .lte(300, { message: 'Значение не может быть больше 300' })
    .or(z.literal(null))
    .transform(transformPlaceholder.number),

  targetBreak: z
    .number({ error: requiredMessage })
    .overwrite((value) => value * 60)
    .gte(1, { error: 'Значение не может быть меньше 1' })
    .lte(900, { error: 'Значение не может быть больше 15 минут' })
    .overwrite((value) => value / 60)
    .or(z.literal(null))
    .transform(transformPlaceholder.number),

  targetWeight: z
    .number({ error: requiredMessage })
    .gte(1, { message: 'Значение не может быть меньше 1' })
    .lte(999.99, { message: 'Значение не может быть больше 999.99' })
    .or(z.literal(null))
    .transform(transformPlaceholder.number),
});

const trainingManageValidationSchema = z.object({
  name: z
    .string({ error: requiredMessage })
    .min(4, { message: 'Не меньше 4 символов' })
    .max(254, { message: 'Слишком длинное имя' }),

  description: z.string().optional().transform(transformPlaceholder.optional),

  type: z.enum(['LIGHT', 'MEDIUM', 'HARD', 'MIXED'] as const, { message: requiredMessage }),

  wormUpDuration: z
    .number()
    .gte(3, { message: 'Значение не может быть меньше 3' })
    .lte(60, { message: 'Значение не может быть больше 60' })
    .optional(),

  postTrainingDuration: z
    .number()
    .gte(3, { message: 'Значение не может быть меньше 3' })
    .lte(60, { message: 'Значение не может быть больше 60' })
    .optional(),

  exercises: z
    .array(
      z.object({
        id: z.number({ message: requiredMessage }),
        name: z
          .string({ message: requiredMessage })
          .min(4, { message: 'Не меньше 4 символов' })
          .max(254, { message: 'Слишком длинное имя' }),
        type: z.enum(['WORM-UP', 'POST-TRAINING', 'AEROBIC', 'ANAEROBIC'], {
          message: requiredMessage,
        }),
        description: z.string().optional(),
        exampleUrl: z.string().optional(),
        repetitions: z
          .array(repetitionSchema, { error: requiredMessage })
          .min(1, { message: 'Необходимо задать подходы' })
          .max(20, { message: '20 подходов максимум' }),
      }),
      { error: requiredMessage },
    )
    .min(1, { message: 'Необходимо добавить упражнения' })
    .max(10, { message: '10 упражнений максимум' }),
});

export { trainingManageValidationSchema };
