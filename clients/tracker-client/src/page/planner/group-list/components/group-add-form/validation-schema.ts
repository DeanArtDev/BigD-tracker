import { transformPlaceholder } from '@/shared/lib/utils/zod';
import { z } from 'zod/v4';

const validationSchema = z.object({
  name: z
    .string({ error: '' })
    .min(4, { error: 'Не меньше 4 символов' })
    .max(254, { error: 'Слишком длинное имя' }),

  description: z.string().optional().transform(transformPlaceholder.optional),
});

export { validationSchema };
