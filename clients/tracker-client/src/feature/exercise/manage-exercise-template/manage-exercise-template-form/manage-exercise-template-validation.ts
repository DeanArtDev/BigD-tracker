import { transformPlaceholder } from '@/shared/lib/utils/zod';
import { z } from 'zod';

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

const validationSchema = z.object({
  name: z
    .string({ error: requiredMessage })
    .min(4, { message: 'Не меньше 4 символов' })
    .max(254, { message: 'Слишком длинное имя' }),

  type: z.enum(['WORM-UP', 'POST-TRAINING', 'AEROBIC', 'ANAEROBIC'] as const, {
    message: requiredMessage,
  }),

  description: z.string().optional().transform(transformPlaceholder.optional),

  url: z
    .string()
    .trim()
    .refine(
      (val) => {
        if (val == null || val.trim() === '') return true;
        return val.startsWith('https://www.youtube.com/') || val.startsWith('https://youtu.be/');
      },
      {
        message: 'Ссылка должна вести на youtube видео',
      },
    )
    .optional()
    .transform(transformPlaceholder.optional),

  repetitions: z
    .array(repetitionSchema)
    .min(1, { message: 'Необходимо задать подходы' })
    .max(20, { message: '20 подходов максимум' }),
});

export { validationSchema };
