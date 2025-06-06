import { z } from 'zod';
import type { ManageExerciseTemplateFormData } from './manage-exercise-template-form';

const requiredMessage = 'Обязательное поле';

const validationSchema: z.Schema<ManageExerciseTemplateFormData> = z.object({
  name: z
    .string({ required_error: requiredMessage })
    .min(4, { message: 'Не меньше 4 символов' })
    .max(254, { message: 'Слишком длинное имя' }),

  type: z.enum(['WORM-UP', 'POST-TRAINING', 'AEROBIC', 'ANAEROBIC'] as const, {
    message: requiredMessage,
  }),

  description: z.string().or(z.undefined()),

  url: z
    .string()
    .trim()
    .refine(
      (val) => {
        if (val == null || val.trim() === '') return true;
        return val.startsWith('https://www.youtube.com/');
      },
      {
        message: 'Ссылка должна вести на youtube видео',
      },
    )
    .or(z.undefined())
    .transform((v) => (v === '' ? undefined : v)),
});

export { validationSchema };
