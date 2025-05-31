import { z } from 'zod';
import type { ManageExerciseTemplateFormData } from './manage-exercise-template-form';

const requiredMessage = 'Обязательное поле';

const validationSchema: z.Schema<ManageExerciseTemplateFormData> = z.object({
  name: z
    .string({ required_error: requiredMessage })
    .min(4, { message: 'Не меньше 4 символов' }),

  type: z.enum(['WORM-UP', 'POST-TRAINING', 'AEROBIC', 'ANAEROBIC'] as const, {
    message: requiredMessage,
  }),

  description: z.string().or(z.undefined()),

  url: z
    .string()
    .url({ message: 'Не валидная ссылка' })
    .refine((val) => val.startsWith('https://www.youtube.com/'), {
      message: 'Ссылка не ведет на youtube видео',
    })
    .or(z.undefined()),
});

export { validationSchema };
